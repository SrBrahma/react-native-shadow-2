<div align="center">

[![npm](https://img.shields.io/npm/v/react-native-shadow-2)](https://www.npmjs.com/package/react-native-shadow-2)
[![TypeScript](https://badgen.net/npm/types/env-var)](http://www.typescriptlang.org/)
[![npm](https://img.shields.io/npm/dm/react-native-shadow-2)](https://www.npmjs.com/package/react-native-shadow-2)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

</div>


# react-native-shadow-2

[react-native-shadow](https://github.com/879479119/react-native-shadow) is dead for years. This one is an improved version with more functionalities, Typescript support and written from scratch. Also, it doesn't require the usage of the `size` property: the shadow is smartly applied on the first render and then precisely reapplied on the following renders.

It solves the old React Native issue of not having the same shadow appearence and implementation for Android, iOS and Web.

The [ethercreative/react-native-shadow-generator](https://ethercreative.github.io/react-native-shadow-generator) website won't give you very similar results between the two platforms, for the reasons I described [here](https://github.com/ethercreative/react-native-shadow-generator/issues/2#issuecomment-738130722), when I started to think more seriously about this shadow issue.

Compatible with Android, iOS and Web. **And Expo!**

Supports [RTL](https://reactnative.dev/blog/2016/08/19/right-to-left-support-for-react-native-apps).

### [❗ Read the FAQ below!](#️-faq)

## [🍟 Demo / Expo Snack Sandbox](https://snack.expo.io/@srbrahma/react-native-shadow-2-sandbox)
> Give the library a quick try!

## [📰 7.0.0 Changelog - 2022-07-30](./CHANGELOG.md)
> **There are important breaking changes! Read the Changelog if upgrading!**

## [↪️ < 7.0.0 Readme](https://github.com/SrBrahma/react-native-shadow-2/blob/4b58bedca1a417fe9760c1a22bf1208f9ff181ad/README.md)
> Previous Readme, in case you are still using previous versions.

## 💿 Installation

### 1. Install [react-native-svg](https://github.com/react-native-svg/react-native-svg#installation).

### 2. Then install react-native-shadow-2:

```bash
npm i react-native-shadow-2
# or
yarn add react-native-shadow-2
```


## 📖 Usage

### Basic
```tsx
import { Shadow } from 'react-native-shadow-2';

<Shadow>
  <Text style={{ margin: 20, fontSize: 20 }}>🙂</Text>
</Shadow>
```

![Example 1](./resources/README/react-native-shadow-2-ex-1.png)

### Advanced
```tsx
<Shadow distance={15} startColor={'#eb9066d8'} endColor={'#ff00ff10'} offset={[3, 4]}>
  <View style={{ borderTopStartRadius: 24, borderBottomEndRadius: 0, borderRadius: 10, backgroundColor: '#c454f0dd' }}>
    <Text style={{ margin: 20, fontSize: 20 }}>🤯</Text>
  </View>
</Shadow>
```

![Example 2](./resources/README/react-native-shadow-2-ex-2.png)

## Properties

#### All properties are optional.

<!--$shadowProperties-->

| Property | Description | Type | Default
| --- | --- | --- | ---
| **startColor** | The color of the shadow when it's right next to the given content, leaving it. Accepts alpha channel. | `string` | `'#00000020'`
| **endColor** | The color of the shadow at the maximum distance from the content. Accepts alpha channel. | `string` | Transparent color of startColor. [Explanation](https://github.com/SrBrahma/react-native-shadow-2/issues/31#issuecomment-985578972)
| **distance** | How far the shadow goes. | `number` | `10`
| **offset** | Moves the shadow. Negative `x` moves it left, negative `y` moves it up.<br/><br/>Accepts `'x%'` values, in relation to the child's size.<br/><br/>Setting an offset will default `paintInside` to true, as it's usually the desired behaviour. | `[x: string \| number, y: string \| number]` | `[0, 0]`
| **paintInside** | If the shadow should be applied inside the external shadows, below the child. `startColor` is used as fill color.<br/><br/>Useful when using `offset` or if your child has some transparency. | `boolean` | `false`, but `true` if `offset` is defined
| **sides** | The sides that will have their shadows drawn. Doesn't include corners. | `("left" \| "right" \| "top" \| "bottom")[]` | `['left', 'right', 'top', 'bottom']`
| **corners** | The corners that will have their shadows drawn. | `("topStart" \| "topEnd" \| "bottomStart" \| "bottomEnd")[]` | `['topStart', 'topEnd', 'bottomStart', 'bottomEnd']`
| **style** | The style of the view that wraps your child component.<br/><br/>If using the `size` property, this wrapping view will automatically receive as style the `size` values and the radiuses from the `radius` property or from the child, if `getChildRadius`. | `StyleProp<ViewStyle>` | `undefined`
| **containerStyle** | The style of the view that contains the shadow and your child component. | `StyleProp<ViewStyle>` | `undefined`
| **stretch** | If your children shall ocuppy all available horizontal space. [Explanation](https://github.com/SrBrahma/react-native-shadow-2/issues/7#issuecomment-899784537). | `boolean` | `false`
| **safeRender** | If you don't want the relative sizing and positioning of the shadow on the 1st render but only on the 2nd render and beyond with the exact onLayout sizes. Useful if dealing with radii greater than the sides sizes, to avoid visual artifacts on the first render.<br/><br/>When `true`, the shadow only appears after the first render, where it's invisible. | `boolean` | `false`
<!--/$shadowProperties-->

## ⁉️ FAQ

**Q**: How to set the Shadow opacity?

**A**: The opacity in react-native-shadow-2, differently from the "original" version, is set directly at the `startColor` and `finalColor` properties, in the alpha channel. E.g.: `'#0001'` would be an almost transparent black. You may also use `'#rrggbbaa'`, `'rgba()'`, `'hsla()'` etc. [All patterns in this link, but not int colors, are accepted](https://reactnative.dev/docs/colors).


**Q**: [My component is no longer using the available parent width after applying the Shadow! What to do?](https://github.com/SrBrahma/react-native-shadow-2/issues/7#issuecomment-899764882)

**A**: Use the `stretch` property or `style={{alignSelf: 'stretch'}}` in your Shadow component. Explanation in link above!


**Q**: I want a preset for my Shadows, so I don't have to type the same props among them and I want to quickly change them all if I want to!

**A**: This package exports the `ShadowProps` type, that are the props of the Shadow component. You may do the following:
```tsx
export const ShadowPresets = {
  button: {
    offset: [0, 1], distance: 1, startColor: '#0003',
  } as ShadowProps,
};
```
and then in your Shadow component:
```tsx
<Shadow {...ShadowPresets.button}>
```

**Q**: The `offset` and `size` properties are throwing Typescript errors!

**A**: Upgrade your Typescript to at least 4.0.0! Those two properties use [**labeled tuples**](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#labeled-tuple-elements). If you don't use Typescript, this won't happen.


## Performance Guide

> While you usually won't have any performance issues by using this, you may have performance issues if you have many Shadows in your screen, like in a FlatList. Those may help you to improve your performance:

* In `style` and on child's `style`, avoid using inline styles (eg `{{flex: 1}}`). Prefer using styles from `StyleSheet.create`. If you are using arrays for the styles (eg `style={[styles.view, {flex: 1}]}`), have this array creation outside the component or inside an `useMemo`, so it isn't unnecessarily created a new reference at each render and we can better memoize the Shadow.

## 🐛 Notes / Known Issues

* [Setting (or obtaining from the child) a too high `radius` (`> size/2`) will mess the shadow.](https://github.com/SrBrahma/react-native-shadow-2/issues/15)
**Update v5:** The radius is now properly limited on the 2nd render and beyond! You may use the safeRender to don't render the shadow until this 2nd render, when the onLayout happens and we get the exact sizes to apply this limit.
