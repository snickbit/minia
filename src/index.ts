import {computed, reactive, toRefs, unref, watch} from 'vue-demi'
import {isArray, isCallable, isEmpty, isPromise, isSingleWith, isString, objectClone, parse, uuid} from '@remedyred/utilities'
import mitt from 'mitt'
import localforage from 'localforage'

export class Minia {
	stores = {}
	waiting = {}
	pending = {}
	emitter = mitt()

	constructor() {
		if(Minia._instance) {
			return Minia._instance
		}
		Minia._instance = this
		Minia._id = uuid()
	}

	get(id) {
		return this.stores[id]
	}

	set(id, value) {
		this.stores[id] = value
		if(this.waiting[id]) {
			this.waiting[id].forEach(cb => cb(value))
			delete this.waiting[id]
		}
	}

	events() {
		return this.emitter.all
	}

	on(...args) {
		const callback = args.pop()
		this.emitter.on(args.join('.'), callback)
	}

	off(...args) {
		const callback = args.pop()
		this.emitter.off(args.join('.'), callback)
	}

	emit(...args) {
		const data = args.pop()
		this.emitter.emit(args.join('.'), data)
	}
}

export const minia = new Minia()

export class Store {
	#state = reactive({})
	#originalState = {}
	#storage = null

	#proxy = null

	#actions = {}
	#getters = {}

	options = {
		name: 'default',
		persist: []
	}

	#ready = false

	constructor(name, options, hydration) {
		this.$config(name, options, hydration)

		this.#proxy = new Proxy(this, {
			get(target, prop, receiver) {
				if(prop in target) {
					return target[prop]
				}

				if(target.$has(prop)) {
					return target.$get(prop)
				}

				if(prop in target.#actions) {
					return target.#callAction.bind(target, prop)
				}

				if(prop in target.#getters) {
					return target.#callGetter.call(target, prop)
				}

				return Reflect.get(...arguments)
			},
			set: function(target, prop, value) {
				target.$set(prop, value)
				return true
			}
		})

		this.$state = new Proxy(this.#state, {
			get: (target, prop) => {
				if(this.$has(prop)) {
					return this.$get(prop)
				}
				return undefined
			},
			set: (target, prop, value) => {
				this.$set(prop, value)
				return true
			}
		})

		this.$getters = new Proxy(this.#getters, {
			get: (target, key) => {
				if(key in target) {
					return this.#callGetter(key)
				}
				return undefined
			}
		})

		this.$actions = new Proxy(this.#actions, {
			get: (target, key) => {
				if(key in target) {
					return this.#callAction.bind(this, key)
				}
				throw new Error(`Call to undefined action ${key}`)
			}
		})

		return this.#proxy
	}

	get $id() {
		return this.options.name
	}

	get $ready() {
		return this.#ready
	}

	#id = (...keys) => ['minia', this.$id, ...keys].join('.')

	#loadFromStorage(key) {
		const value = this.#storage.getItem(this.#id(key))
		if(isPromise(value)) {
			value.then(value => {
				if(null !== value) this.#state[key] = parse(value)
			})
		} else {
			this.#state[key] = parse(value)
		}
	}

	#saveToStorage(key, value) {
		this.#storage.setItem(this.#id(key), JSON.stringify(value))
	}

	#callAction(name, ...args) {
		return this.#actions[name].call(this, ...args)
	}

	#callGetter(name) {
		return unref(this.#getters[name])
	}

	#shouldPersist(key) {
		return this.options.persist === true || this.options.persist.includes(key)
	}

	$config(name, options, hydration) {
		let isPending = (!options && !hydration)
		if(isPending) {
			options = {}
			hydration = {}
		}

		const {actions, getters, ...rest} = options
		this.options = {
			...this.options,
			...rest,
			name
		}

		this.#storage = options.storage || localforage

		if(!isPending) {
			hydration = unref(hydration)
			this.#originalState = objectClone(hydration)
			for(let key in hydration) {
				if(this.#shouldPersist(key)) {
					this.#loadFromStorage(key)
				} else {
					this.#state[key] = hydration[key]
				}
			}
		}

		this.#actions = actions || {}

		for(let key in getters) {
			this.#getters[key] = computed(getters[key].bind(this, this.$state))
		}

		this.#ready = !isPending
	}

	$subscribe(...args) {
		let callback
		let keys = []
		for(let arg of args) {
			if(isCallable(arg)) {
				callback = arg
			} else if(isArray(arg)) {
				keys.push(...arg)
			} else if(isString(arg)) {
				keys.push(arg)
			} else {
				throw new TypeError(`Invalid argument type: ${typeof arg}`)
			}
		}
		if(!callback) {
			throw new Error('No callback provided')
		}

		const watchers = {}
		if(isEmpty(keys)) {
			watchers[this.$id] = watch(() => this.#state, callback)
		} else {
			for(let key of keys) {
				watchers[key] = watch(() => this.#state[key], callback)
			}
		}

		// return unsubscribe function
		return keys => {
			const watcherKeys = Object.keys(watchers)
			const keysToRemove = !keys || isSingleWith(keys, this.$id) || isSingleWith(watcherKeys, this.$id) ? watcherKeys : keys
			for(let key of keysToRemove) {
				watchers[key].unsubscribe()
				delete watchers[key]
			}
		}
	}

	$get(key) {
		return unref(this.#state[key])
	}

	$set(key, value) {
		if(this.#shouldPersist(key)) {
			this.#saveToStorage(key, value)
		}
		this.#state[key] = value
	}

	$has(key) {
		return key in this.#state
	}

	$keys() {
		return Object.keys(this.#state)
	}

	$patch(data) {
		for(let key in data) {
			this.$set(key, data[key])
		}
	}

	$reset() {
		this.#state = toRefs(this.#originalState)
	}

	$on(name, callback) {
		minia.on(this.#id(name), callback)
	}

	$off(name, callback) {
		minia.off(this.#id(name), callback)
	}

	$emit(name, value) {
		minia.emit(this.#id(name), value)
	}
}

export function createStore(name = 'default', options = {}, hydration = {}) {
	if(!minia.get(name)) {
		let store
		if(minia.pending[name]) {
			store = minia.pending[name]
			store.$config(name, options, hydration)
		} else {
			store = new Store(name, options, hydration)
		}

		minia.set(name, store)
	}

	return minia.get(name)
}

function createPending(name = 'default') {
	minia.pending[name] = new Store(name)
	return minia.pending[name]
}

export function useStore(name = 'default') {
	if(!minia.get(name)) {
		return createPending(name)
	}
	return minia.get(name)
}

useStore.promise = async (name = 'default') => {
	if(!minia.get(name)) {
		return new Promise((resolve) => {
			if(!minia.waiting[name]) minia.waiting[name] = []
			minia.waiting[name].push(resolve)
		})
	}
	return minia.get(name)
}
