# react-native-shadow-2

[react-native-shadow](https://github.com/879479119/react-native-shadow) is dead for years. This one is an improved version, written from scratch.

## Installation

You will need [react-native-svg](https://github.com/react-native-svg/react-native-svg).

Then, install this package:

`npm i react-native-shadow-2`

or 

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
* `radius` (number, default: `0`) - The border radius of your component. You may specify each corner value.
* `offset` (array, default: `[0, 0]`)

There are other optional properties available that will be added here in this README latter. Intellisense will be your guide for now.

## Roadmap

* Fix visual error when setting too high radiuses
* Offset with transparent content, without shadow below the content.
