<div align="center">


[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![TypeScript](https://badgen.net/npm/types/env-var)](http://www.typescriptlang.org/)
[![npm](https://img.shields.io/npm/v/react-native-shadow-2)](https://www.npmjs.com/package/react-native-shadow-2)
[![npm](https://img.shields.io/npm/dt/react-native-shadow-2)](https://www.npmjs.com/package/react-native-shadow-2)

</div>

# react-native-shadow-2

[react-native-shadow](https://github.com/879479119/react-native-shadow) is dead for years. This one is an improved version with more functionalities, Typescript support and written from scratch.

It solves the problem of React Native not having the same shadow appearence for Android and iOS. It also works on old Android versions, where `elevation` wasn't available.

The [ethercreative/react-native-shadow-generator](https://ethercreative.github.io/react-native-shadow-generator) website won't give you very similar results between the two platforms, for the reasons I described [here](https://github.com/ethercreative/react-native-shadow-generator/issues/2#issuecomment-738130722), when I started to think about the solution to this shadow issue.

**2021/05/01**: You should also check the [react-native-neomorph-shadows](https://github.com/tokkozhin/react-native-neomorph-shadows) package before deciding to use this one. You may prefer using it, looks really great! It doesn't support expo though, as my package does.


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
* `finalColor` (string, default: `'#00000000' (= 'transparent')`)
* `distance` (number, default: `10`) - How far the shadow will go from the borders
* `radius` (number, default: `0`) - The border radius of your component. You may specify each corner value.
* `offset` ([x: number, y: number], default: `[0, 0]`)
* `size` ([width: number, height: number]) - It isn't required, as it is with react-native-shadow. If you do not pass the size, it will automatically get your component size with onLayout and on the next render apply the shadow properly. So, if not declaring the size, it won't have a shadow on the first render. Looks like I found a way to apply it on the first render automatically, but requires further research. You may open an issue about it so I may feel more motivated to do it hehe

There are other optional properties available that will be added here in this README later. Intellisense will be your guide for now.

## Roadmap

* Fix visual error when setting too high radiuses
* Offset with transparent content, without shadow below the content.
