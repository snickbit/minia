// @ts-expect-error ts-migrate(2305) FIXME: Module '"../node_modules/vue-demi/lib"' has no exp... Remove this comment to see the full error message
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
// @ts-expect-error ts-migrate(2339) FIXME: Property '_instance' does not exist on type 'typeo... Remove this comment to see the full error message
		if(Minia._instance) {
// @ts-expect-error ts-migrate(2339) FIXME: Property '_instance' does not exist on type 'typeo... Remove this comment to see the full error message
			return Minia._instance
		}
// @ts-expect-error ts-migrate(2339) FIXME: Property '_instance' does not exist on type 'typeo... Remove this comment to see the full error message
		Minia._instance = this
// @ts-expect-error ts-migrate(2339) FIXME: Property '_id' does not exist on type 'typeof Mini... Remove this comment to see the full error message
		Minia._id = uuid()
	}

// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'id' implicitly has an 'any' type.
	get(id) {
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
		return this.stores[id]
	}

// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'id' implicitly has an 'any' type.
	set(id, value) {
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
		this.stores[id] = value
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
		if(this.waiting[id]) {
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
			this.waiting[id].forEach(cb => cb(value))
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
			delete this.waiting[id]
		}
	}

	events() {
		return this.emitter.all
	}

// @ts-expect-error ts-migrate(7019) FIXME: Rest parameter 'args' implicitly has an 'any[]' ty... Remove this comment to see the full error message
	on(...args) {
		const callback = args.pop()
		this.emitter.on(args.join('.'), callback)
	}

// @ts-expect-error ts-migrate(7019) FIXME: Rest parameter 'args' implicitly has an 'any[]' ty... Remove this comment to see the full error message
	off(...args) {
		const callback = args.pop()
		this.emitter.off(args.join('.'), callback)
	}

// @ts-expect-error ts-migrate(7019) FIXME: Rest parameter 'args' implicitly has an 'any[]' ty... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'name' implicitly has an 'any' type.
	constructor(name, options, hydration) {
		this.$config(name, options, hydration)

// @ts-expect-error ts-migrate(2322) FIXME: Type 'this' is not assignable to type 'null'.
		this.#proxy = new Proxy(this, {
			get(target, prop, receiver) {
				if(prop in target) {
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2556) FIXME: Expected 2-3 arguments, but got 0 or more.
				return Reflect.get(...arguments)
			},
			set: function(target, prop, value) {
				target.$set(prop, value)
				return true
			}
		})

// @ts-expect-error ts-migrate(2551) FIXME: Property '$state' does not exist on type 'Store'. ... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2551) FIXME: Property '$getters' does not exist on type 'Store'... Remove this comment to see the full error message
		this.$getters = new Proxy(this.#getters, {
			get: (target, key) => {
				if(key in target) {
					return this.#callGetter(key)
				}
				return undefined
			}
		})

// @ts-expect-error ts-migrate(2551) FIXME: Property '$actions' does not exist on type 'Store'... Remove this comment to see the full error message
		this.$actions = new Proxy(this.#actions, {
			get: (target, key) => {
				if(key in target) {
					return this.#callAction.bind(this, key)
				}
// @ts-expect-error ts-migrate(2731) FIXME: Implicit conversion of a 'symbol' to a 'string' wi... Remove this comment to see the full error message
				throw new Error(`Call to undefined action ${key}`)
			}
		})

// @ts-expect-error ts-migrate(2322) FIXME: Type 'null' is not assignable to type 'Store'.
		return this.#proxy
	}

	get $id() {
		return this.options.name
	}

	get $ready() {
		return this.#ready
	}

// @ts-expect-error ts-migrate(7019) FIXME: Rest parameter 'keys' implicitly has an 'any[]' ty... Remove this comment to see the full error message
	#id = (...keys) => ['minia', this.$id, ...keys].join('.')

// @ts-expect-error ts-migrate(18022) FIXME: A method cannot be named with a private identifier... Remove this comment to see the full error message
	#loadFromStorage(key) {
// @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
		const value = this.#storage.getItem(this.#id(key))
		if(isPromise(value)) {
// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'value' implicitly has an 'any' type.
			value.then(value => {
				if(null !== value) this.#state[key] = parse(value)
			})
		} else {
			this.#state[key] = parse(value)
		}
	}

// @ts-expect-error ts-migrate(18022) FIXME: A method cannot be named with a private identifier... Remove this comment to see the full error message
	#saveToStorage(key, value) {
// @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
		this.#storage.setItem(this.#id(key), JSON.stringify(value))
	}

// @ts-expect-error ts-migrate(18022) FIXME: A method cannot be named with a private identifier... Remove this comment to see the full error message
	#callAction(name, ...args) {
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
		return this.#actions[name].call(this, ...args)
	}

// @ts-expect-error ts-migrate(18022) FIXME: A method cannot be named with a private identifier... Remove this comment to see the full error message
	#callGetter(name) {
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
		return unref(this.#getters[name])
	}

// @ts-expect-error ts-migrate(18022) FIXME: A method cannot be named with a private identifier... Remove this comment to see the full error message
	#shouldPersist(key) {
// @ts-expect-error ts-migrate(2367) FIXME: This condition will always return 'false' since th... Remove this comment to see the full error message
		return this.options.persist === true || this.options.persist.includes(key)
	}

// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'name' implicitly has an 'any' type.
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
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
			this.#getters[key] = computed(getters[key].bind(this, this.$state))
		}

		this.#ready = !isPending
	}

// @ts-expect-error ts-migrate(7019) FIXME: Rest parameter 'args' implicitly has an 'any[]' ty... Remove this comment to see the full error message
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
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
			watchers[this.$id] = watch(() => this.#state, callback)
		} else {
			for(let key of keys) {
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
				watchers[key] = watch(() => this.#state[key], callback)
			}
		}

		// return unsubscribe function
// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'keys' implicitly has an 'any' type.
		return keys => {
			const watcherKeys = Object.keys(watchers)
			const keysToRemove = !keys || isSingleWith(keys, this.$id) || isSingleWith(watcherKeys, this.$id) ? watcherKeys : keys
			for(let key of keysToRemove) {
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
				watchers[key].unsubscribe()
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
				delete watchers[key]
			}
		}
	}

// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'key' implicitly has an 'any' type.
	$get(key) {
		return unref(this.#state[key])
	}

// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'key' implicitly has an 'any' type.
	$set(key, value) {
		if(this.#shouldPersist(key)) {
			this.#saveToStorage(key, value)
		}
		this.#state[key] = value
	}

// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'key' implicitly has an 'any' type.
	$has(key) {
		return key in this.#state
	}

	$keys() {
		return Object.keys(this.#state)
	}

// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'data' implicitly has an 'any' type.
	$patch(data) {
		for(let key in data) {
			this.$set(key, data[key])
		}
	}

	$reset() {
		this.#state = toRefs(this.#originalState)
	}

// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'name' implicitly has an 'any' type.
	$on(name, callback) {
		minia.on(this.#id(name), callback)
	}

// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'name' implicitly has an 'any' type.
	$off(name, callback) {
		minia.off(this.#id(name), callback)
	}

// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'name' implicitly has an 'any' type.
	$emit(name, value) {
		minia.emit(this.#id(name), value)
	}
}

export function createStore(name = 'default', options = {}, hydration = {}) {
	if(!minia.get(name)) {
		let store
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
		if(minia.pending[name]) {
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
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
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
	minia.pending[name] = new Store(name)
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
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
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
			if(!minia.waiting[name]) minia.waiting[name] = []
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
			minia.waiting[name].push(resolve)
		})
	}
	return minia.get(name)
}
