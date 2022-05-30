import {Minia, PromiseResolve} from './Minia'
import {Store} from './Store'

export {Minia, Store}
export const minia = new Minia()

export function createStore(name = 'default', options = {}, hydration = {}) {
	if (!minia.get(name)) {
		let store

		if (minia.pending[name]) {
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
	if (!minia.get(name)) {
		return createPending(name)
	}
	return minia.get(name)
}

useStore.promise = async (name = 'default') => {
	if (!minia.get(name)) {
		return new Promise((resolve: PromiseResolve<any>) => {
			minia.wait(name, resolve)
		})
	}
	return minia.get(name)
}
