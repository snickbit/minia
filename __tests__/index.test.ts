import {createStore, Minia, Store} from '../src'

describe('Minia', () => it('new Minia() should be an instance of Minia', () => expect(new Minia()).toBeInstanceOf(Minia)))

describe('createStore', () => {
	let instance: Store
	beforeEach(() => instance = createStore())
	it('createStore() instance should be an instance of Store', () => expect(instance).toBeInstanceOf(Store))
	it('instance should have the id "default"', () => expect(instance.$id).toBe('default'))
})

