# react-native-shadow-2

Aims to be the successor to `react-native-shadow`.

## Installation

`yarn add react-native-shadow-2`

## Usage

```js
import { Shadow } from 'react-native-shadow-2';

<Shadow distance={8} startColor={'#000'}>
  ...
</Shadow>
```

### Properties

* `startColor` (string, default: `'#00000010'`)
* `finalColor` (string, default: `'transparent'`)
* `distance` (number, default: `10`)
* `radius` (number, default: `0`)
* `offset` (array, default: `[0, 0]`)

## Roadmap

* Fix visual error when setting too high radiuses
* Offset with transparent content, without shadow below the content.
