# Class: Minia

## Table of contents

### Constructors

- [constructor](Minia.md#constructor)

### Properties

- [emitter](Minia.md#emitter)
- [pending](Minia.md#pending)
- [stores](Minia.md#stores)
- [waiting](Minia.md#waiting)

### Methods

- [emit](Minia.md#emit)
- [events](Minia.md#events)
- [get](Minia.md#get)
- [off](Minia.md#off)
- [on](Minia.md#on)
- [set](Minia.md#set)
- [wait](Minia.md#wait)

## Constructors

### constructor

• **new Minia**()

## Properties

### emitter

• **emitter**: `Emitter`<`Record`<`EventType`, `unknown`\>\>

___

### pending

• **pending**: `Pending` = `{}`

___

### stores

• **stores**: `Stores` = `{}`

___

### waiting

• **waiting**: `Waiting` = `{}`

## Methods

### emit

▸ **emit**(...`args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any`[] |

#### Returns

`void`

___

### events

▸ **events**(): `EventHandlerMap`<`Record`<`EventType`, `unknown`\>\>

#### Returns

`EventHandlerMap`<`Record`<`EventType`, `unknown`\>\>

___

### get

▸ **get**(`id`): [`Store`](Store.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

[`Store`](Store.md)

___

### off

▸ **off**(...`args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any`[] |

#### Returns

`void`

___

### on

▸ **on**(...`args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any`[] |

#### Returns

`void`

___

### set

▸ **set**(`id`, `value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `value` | [`Store`](Store.md) |

#### Returns

`void`

___

### wait

▸ **wait**(`id`, `resolve`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `resolve` | `PromiseResolve`<`any`\> |

#### Returns

`void`
