# @snickbit/minia

## Table of contents

### Namespaces

- [useStore](modules/useStore.md)

### Classes

- [Minia](classes/Minia.md)
- [Store](classes/Store.md)

### Variables

- [minia](README.md#minia)

### Functions

- [createStore](README.md#createstore)
- [useStore](README.md#usestore)

## Variables

### minia

• `Const` **minia**: [`Minia`](classes/Minia.md)

## Functions

### createStore

▸ **createStore**(`name?`, `options?`, `hydration?`): [`Store`](classes/Store.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `name` | `string` | `'default'` |
| `options` | `Object` | `{}` |
| `hydration` | `Object` | `{}` |

#### Returns

[`Store`](classes/Store.md)

___

### useStore

▸ **useStore**(`name?`): [`Store`](classes/Store.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `name` | `string` | `'default'` |

#### Returns

[`Store`](classes/Store.md)
