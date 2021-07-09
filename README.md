<!--
  README generated with handlebars, typedoc-plugin-markdown and my
  temporary typedoc-plugin-markdown to table code.

  The README.hbs is in resources/README.hbs.

  DO NOT edit the README.md, but the README.hbs and then run `npm run readme`.
 -->


<div align="center">

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![TypeScript](https://badgen.net/npm/types/env-var)](http://www.typescriptlang.org/)
[![npm](https://img.shields.io/npm/v/react-native-shadow-2)](https://www.npmjs.com/package/react-native-shadow-2)
[![npm](https://img.shields.io/npm/dw/react-native-shadow-2)](https://www.npmjs.com/package/react-native-shadow-2)

</div>


# react-native-shadow-2

[react-native-shadow](https://github.com/879479119/react-native-shadow) is dead for years. This one is an improved version with more functionalities, Typescript support and written from scratch.

It solves the problem of React Native not having the same shadow appearence for Android, iOS and Web. It also works on old Android versions, where `elevation` wasn't available.

The [ethercreative/react-native-shadow-generator](https://ethercreative.github.io/react-native-shadow-generator) website won't give you very similar results between the two platforms, for the reasons I described [here](https://github.com/ethercreative/react-native-shadow-generator/issues/2#issuecomment-738130722), when I started to think about the solution to this shadow issue.

Compatible with Android, iOS and Web. And Expo!


## 🥳 New version 3.0.0! (2021-06-25) 🥳

### The long waited and most wanted feature is out!

Before this new version, it was required to manually enter your component size or leave it as undefined and the integrated onLayout would get its size and apply it on the next render.

Now, this package is way smarter. **The property `size` no longer exists and the shadow is applied on the same render**. A big game changer! You may be interested in taking a look into the source code to see how much changed and the new hacks I discovered that made this possible.


## 💿 Installation

### 1. You first need [react-native-svg](https://github.com/react-native-svg/react-native-svg).

### 2. Then, install react-native-shadow-2:

```C
npm i react-native-shadow-2
# or
yarn add react-native-shadow-2
```


## 📖 Usage


```ts
import { Shadow } from 'react-native-shadow-2';

<Shadow>
  <View>
    <Text style={\{ margin: 20, fontSize: 20 \}}>🙂</Text>
  </View>
</Shadow>
```

![Example 1](./resources/README/react-native-shadow-2-ex-1.png)

```ts
import { View, Text } from 'react-native'
import { Shadow } from 'react-native-shadow-2';

<Shadow startColor={'#0004'} finalColor>
   <View> {/* Your component */}
   </View>
</Shadow>
```

## Properties

| Property | Type | Default | Description
  | --- | --- | --- | ---
| **startColor** | `string` | `'#00000020'` | The color of the shadow when it's right next to the given content, leaving it.<br/>Accepts alpha channel.
| **finalColor** | `string` | `'#0000', transparent.` | The color of the shadow at the maximum distance from the content.
| **distance** | `number` | `10` | How far the shadow will go.
| **containerViewStyle** | `StyleProp<ViewStyle>` | `undefined` | The style of the view that contains the shadow and the children.
| **radius** | `number \| { default?: number ; topLeft?: number ; topRight?: number ; bottomLeft?: number ; bottomRight?: number  }` | `undefined` | The radius of each corner of your child component. Passing a number will apply it to all corners.<br/><br/>If passing an object, undefined corners will have the radius of the `default` property if it's defined.<br/><br/>If undefined and if getChildRadius, it will attempt to get the child radius from the borderRadius style.<br/><br/>Fallbacks to 0.
| **getChildRadius** | `boolean` | `true` | If it should try to get the radius from the child if `radius` prop is undefined. It will get the values for each<br/>corner, like `borderTopLeftRadius`, and also `borderRadius`. If a specific corner isn't defined, `borderRadius` value is used.<br/>If `borderRadius` isn't defined or < 0, 0 will be used.
| **sides** | `Side[]` | `['left', 'right', 'top', 'bottom']` | The sides of your content that will have the shadows drawn. Doesn't include corners.
| **corners** | `Corner[]` | `['topLeft', 'topRight', 'bottomLeft', 'bottomRight']` | The corners that will have the shadows drawn.
| **offset** | `[x: string \| number, y: string \| number]` | `[0, 0]` | Moves the shadow. Negative x moves it to the left, negative y moves it up.<br/><br/>Accepts 'x%' values, in relation to the child's size.<br/><br/>Read paintInside property description for related configuration.
| **paintInside** | `boolean` | `false` | If the shadow should be applied inside the external shadows, below the child.<br/><br/>You may want this as true when using offset or if your child have some transparency.



## 🐛 Known Issues

* Percentage values for child's borderRadius won't work with `getChildRadius` property.
* Setting (or obtaining from child) a `radius` too high (`> size/2`) will mess the shadow.

## 📰 [Changelog](./CHANGELOG.md)

## 🦉 Alternatives
* [react-native-neomorph-shadows](https://github.com/tokkozhin/react-native-neomorph-shadows) looks great and has different possibilities. It doesn't support Expo though, as `react-native-shadow-2` does.