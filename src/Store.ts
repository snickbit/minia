import {computed, reactive, toRefs, unref, watch} from 'vue-demi'
import {isArray, isCallable, isEmpty, isPromise, isSingle, isString, objectClone, parse} from '@snickbit/utilities'
import localforage from 'localforage'
import {ComputedRef} from 'vue'
import {minia} from './index'
import {Handler} from 'mitt'

export type StoreKey = string
export type StoreValue = any

export interface StoreOptions {
	name: string
	persist?: boolean | string[]
	getters?: StoreGetters
	actions?: StoreActions

	[key: string]: any
}

export interface StoreState {
	[key: StoreKey]: StoreValue
}

export type WatchStop = () => void
export type Watchers = Record<string, WatchStop>

export type StoreAction = (this: Store, ...args: any[]) => any
export type StoreGetter = (this: Store) => StoreValue

export type StoreActions = Record<string, StoreAction>
export type StoreGetters = Record<string, StoreGetter>
export type StoredGetters = Record<string, ComputedRef>

export interface Store {
	[key: string | symbol]: any
}

export class Store {
	protected state: StoreState = reactive({})
	protected originalState: StoreState = {}
	protected storage: Storage | LocalForage = localforage
	protected proxy: Store
	protected actions: StoreActions = {}
	protected getters: StoredGetters = {}
	protected ready = false

	options: StoreOptions = {
		name: 'default',
		persist: []
	}

	protected id = (...keys: string[]) => ['minia', this.$id, ...keys].join('.')

	constructor(name: string, options?: Partial<StoreOptions>, hydration?: StoreState) {
		this.$config(name, options, hydration)

		this.proxy = new Proxy(this, {
			get(target: Store, prop: string, receiver?: any): any {
				if (prop in target) {
					return target[prop]
				}

				if (target.$has(prop)) {
					return target.$get(prop)
				}

				if (prop in target.actions) {
					return target.callAction.bind(target, prop)
				}

				if (prop in target.getters) {
					return target.callGetter.call(target, prop)
				}

				return Reflect.get(target, prop, receiver)
			},
			set: function (target: Store, prop: string, value?: any) {
				target.$set(prop, value)
				return true
			}
		})

		this.$state = new Proxy(this.state, {
			get: (target: Store, prop: string) => {
				if (this.$has(prop)) {
					return this.$get(prop)
				}
				return undefined
			},
			set: (target: Store, prop: string, value: any) => {
				this.$set(prop, value)
				return true
			}
		})

		this.$getters = new Proxy(this.getters, {
			get: (target: Store, key: string) => {
				if (key in target) {
					return this.callGetter(key)
				}
				return undefined
			}
		})

		this.$actions = new Proxy(this.actions, {
			get: (target, key: string) => {
				if (key in target) {
					return this.callAction.bind(this, key)
				}

				throw new Error(`Call to undefined action ${key}`)
			}
		})

		return this.proxy
	}

	get $id() {
		return this.options.name
	}

	get $ready() {
		return this.ready
	}

	protected loadFromStorage(key: string) {
		const value = this.storage.getItem(this.id(key))
		if (isPromise(value)) {
			(value as Promise<any>).then(value => {
				if (null !== value) this.state[key] = parse(value)
			})
		} else {
			this.state[key] = parse(value)
		}
	}

	protected saveToStorage(key: StoreKey, value: StoreValue) {
		this.storage.setItem(this.id(key), JSON.stringify(value))
	}

	protected callAction(name: string, ...args: any[]) {
		return this.actions[name].call(this, ...args)
	}

	protected callGetter(name: string) {
		return unref(this.getters[name])
	}

	protected shouldPersist(key: StoreKey) {
		return this.options.persist === true || (isArray(this.options.persist) && (this.options.persist as string[]).includes(key))
	}

	$config(name: string, options?: Partial<StoreOptions>, hydration?: StoreState) {
		let isPending = (!options && !hydration)
		if (!options) {
			options = {}
		}
		if (!hydration) {
			hydration = {}
		}
		const {actions, getters, ...rest} = options
		this.options = {
			...this.options,
			...rest,
			name: name || this.options.name || 'default'
		}

		if (options.storage) {
			this.storage = options.storage
		}

		if (!isPending) {
			hydration = unref(hydration)
			this.originalState = objectClone(hydration)
			for (let key in hydration) {
				if (this.shouldPersist(key)) {
					this.loadFromStorage(key)
				} else {
					this.state[key] = hydration[key]
				}
			}
		}

		this.actions = actions || {}

		for (let key in getters) {
			this.getters[key] = computed(getters[key].bind(this, this.$state))
		}

		this.ready = !isPending
	}

	$subscribe(...args: any[]) {
		let callback
		let keys = []
		for (let arg of args) {
			if (isCallable(arg)) {
				callback = arg
			} else if (isArray(arg)) {
				keys.push(...arg)
			} else if (isString(arg)) {
				keys.push(arg)
			} else {
				throw new TypeError(`Invalid argument type: ${typeof arg}`)
			}
		}
		if (!callback) {
			throw new Error('No callback provided')
		}

		const watchers: Watchers = {}
		if (isEmpty(keys)) {
			watchers[this.$id] = watch(() => this.state, callback)
		} else {
			for (let key of keys) {
				watchers[key] = watch(() => this.state[key], callback)
			}
		}

		// return unsubscribe function
		return (keys: string[]) => {
			const watcherKeys = Object.keys(watchers)
			const keysToRemove = !keys || isSingle(keys, this.$id) || isSingle(watcherKeys, this.$id) ? watcherKeys : keys
			for (let key of keysToRemove) {
				watchers[key]()
				delete watchers[key]
			}
		}
	}

	$get(key: StoreKey) {
		return unref(this.state[key])
	}

	$set(key: StoreKey, value: StoreValue) {
		if (this.shouldPersist(key)) {
			this.saveToStorage(key, value)
		}
		this.state[key] = value
	}

	$has(key: StoreKey) {
		return key in this.state
	}

	$keys() {
		return Object.keys(this.state)
	}

	$patch(data: StoreState) {
		for (let key in data) {
			this.$set(key, data[key])
		}
	}

	$reset() {
		this.state = toRefs(this.originalState)
	}

	$on(event: string, callback: Handler) {
		minia.on(this.id(event), callback)
	}

	$off(event: string, callback: Handler) {
		minia.off(this.id(event), callback)
	}

	$emit(event: string, data: any) {
		minia.emit(this.id(event), data)
	}
}
