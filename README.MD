# react-native-shadow-2

[react-native-shadow](https://github.com/879479119/react-native-shadow) is dead for years. This one is an improved version with more functionalities, Typescript support and written from scratch.

It solves the problem of React Native not having the same shadow appearence for Android and iOS. It also works on old Android versions, where `elevation` wasn't available.

The [ethercreative/react-native-shadow-generator](https://ethercreative.github.io/react-native-shadow-generator) website won't give you very similar results, for the reasons I described [here](https://github.com/ethercreative/react-native-shadow-generator/issues/2#issuecomment-738130722), when I started to think about the solution of this shadow issue.

## Installation

You will need to install [react-native-svg](https://github.com/react-native-svg/react-native-svg). For RN > 0.60, it's just `npm i react-native-svg` / `yarn add react-native-svg`.

Then, install this package:

`npm i react-native-shadow-2` / `yarn add react-native-shadow-2`


## Usage

```js
import { Shadow } from 'react-native-shadow-2';

<Shadow distance={8} startColor={'#000'}>
  ... // your component
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
