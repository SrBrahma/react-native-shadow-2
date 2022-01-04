<div align="center">

[![npm](https://img.shields.io/npm/v/react-native-shadow-2)](https://www.npmjs.com/package/react-native-shadow-2)
[![TypeScript](https://badgen.net/npm/types/env-var)](http://www.typescriptlang.org/)
[![npm](https://img.shields.io/npm/dw/react-native-shadow-2)](https://www.npmjs.com/package/react-native-shadow-2)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

</div>


# react-native-shadow-2

[react-native-shadow](https://github.com/879479119/react-native-shadow) is dead for years. This one is an improved version with more functionalities, Typescript support and written from scratch. Also, it doesn't require the usage of the `size` property: the shadow is smartly applied on the first render and then precisely reapplied on the following renders.

It solves the old React Native issue of not having the same shadow appearence and implementation for Android, iOS and Web.

The [ethercreative/react-native-shadow-generator](https://ethercreative.github.io/react-native-shadow-generator) website won't give you very similar results between the two platforms, for the reasons I described [here](https://github.com/ethercreative/react-native-shadow-generator/issues/2#issuecomment-738130722), when I started to think more seriously about this shadow issue.

Compatible with Android, iOS and Web. **And Expo!**

### [Read the FAQ below!](#️-faq)

## [🍟 Demo / Expo Snack Sandbox](https://snack.expo.io/@srbrahma/react-native-shadow-2-sandbox)

## 📰 [Changelog 6.0.0 (2022-01-03)](./CHANGELOG.md)

## 💿 Installation

### 1. First install [react-native-svg](https://github.com/react-native-svg/react-native-svg).

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
<Shadow distance={15} startColor={'#eb9066d8'} finalColor={'#ff00ff10'} offset={[3, 4]}>
  <View style={{ borderTopLeftRadius: 24, borderBottomRightRadius: 0, borderRadius: 10, backgroundColor: '#c454f0dd' }}>
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
| **finalColor** | The color of the shadow at the maximum distance from the content. Accepts alpha channel. | `string` | Transparent color of startColor. [Explanation](https://github.com/SrBrahma/react-native-shadow-2/issues/31#issuecomment-985578972)
| **distance** | How far the shadow will go. | `number` | `10`
| **radius** | The radius of each corner of your child component. Passing a number will apply it to all corners.<br/><br/>If passing an object, undefined corners will have the radius of the `default` property if it's defined.<br/><br/>If undefined and if getChildRadius, it will attempt to get the child radius from the borderRadius style.<br/><br/>Each corner fallbacks to 0. | `number \| { default?: number ; topLeft?: number ; topRight?: number ; bottomLeft?: number ; bottomRight?: number  }` | `undefined`
| **getChildRadius** | If it should try to get the radius from the child view **`style`** if `radius` property is undefined. It will get the values for each corner, like `borderTopLeftRadius`, and also `borderRadius`. If a specific corner isn't defined, `borderRadius` value is used.<br/><br/>If **`getViewStyleRadius`**, the corners defined in viewStyle will have priority over child's style. | `boolean` | `true`
| **getViewStyleRadius** | If it should try to get the radius from the **`viewStyle`** if `radius` property is undefined. It will get the values for each corner, like `borderTopLeftRadius`, and also `borderRadius`. If a specific corner isn't defined, `borderRadius` value is used.<br/><br/>If **`getChildRadius`**, the corners defined in viewStyle will have priority over child's style. | `boolean` | `true`
| **sides** | The sides of your content that will have the shadows drawn. Doesn't include corners. | `("left" \| "right" \| "top" \| "bottom")[]` | `['left', 'right', 'top', 'bottom']`
| **corners** | The corners that will have the shadows drawn. | `("topLeft" \| "topRight" \| "bottomLeft" \| "bottomRight")[]` | `['topLeft', 'topRight', 'bottomLeft', 'bottomRight']`
| **offset** | Moves the shadow. Negative x moves it to the left, negative y moves it up.<br/><br/>Accepts `'x%'` values, in relation to the child's size.<br/><br/>Setting an offset will default `paintInside` to true, as it is the usual desired behaviour. | `[x: string \| number, y: string \| number]` | `[0, 0]`
| **paintInside** | If the shadow should be applied inside the external shadows, below the child. `startColor` is used as fill color.<br/><br/>You may want this as true when using offset or if your child have some transparency.<br/><br/>**The default changes to true if `offset` property is defined.** | `boolean` | `false`
| **viewStyle** | The style of the view that wraps your child component.<br/><br/>If using the `size` property, this wrapping view will automatically receive as style the `size` values and the radiuses from the `radius` property or from the child, if `getChildRadius`. You may overwrite those defaults by undefine'ing the changed styles in this property. | `StyleProp<ViewStyle>` | `undefined`
| **containerViewStyle** | The style of the view that contains the shadow and your child component. | `StyleProp<ViewStyle>` | `undefined`
| **size** | If you don't want the 2 renders of the shadow (first applies the relative positioning and sizing that may contain a quick pixel gap, second uses exact pixel size from onLayout) or you are having noticeable gaps/overlaps on the first render, you can use this property. Using this won't trigger the onLayout, so only 1 render is made.<br/><br/>It will apply the corresponding `width` and `height` styles to the `viewStyle` property.<br/><br/>You may want to set `backgroundColor` in the `viewStyle` property for your child background color.<br/><br/>It's also good if you want an animated view.<br/><br/>The values will be properly rounded using our R() function. | `[width: number, height: number]` | `undefined`
| **safeRender** | If you don't want the relative sizing and positioning of the shadow on the first render but only on the second render and beyond with the exact onLayout sizes. This is useful if dealing with radius greater than the sizes, to assure the fully round corners when the sides sizes are unknown and to avoid weird and overflowing shadows on the first render.<br/><br/>Note that when true, the shadow will only appear on the second render and beyond, when the sizes are known with onLayout. | `boolean` | `false`

<!--/$shadowProperties-->

## ⁉️ FAQ

**Q**: How to set the Shadow opacity?

**A**: The opacity in react-native-shadow-2, differently from the "original" version, is set directly at the `startColor` and `finalColor` properties, in the alpha channel. E.g.: `'#0001'` would be an almost transparent black. You may also use `'#rrggbbaa'`, `'rgba()'`, `'hsla()'` etc. [All patterns in this link, but not int colors, are accepted](https://reactnative.dev/docs/colors).


**Q**: [My component is no longer using the available parent width after applying the Shadow! What to do?](https://github.com/SrBrahma/react-native-shadow-2/issues/7#issuecomment-899764882)

**A**: Use `viewStyle={{alignSelf: 'stretch'}}` in your Shadow component. Explanation in link above!


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

## 🐛 Notes / Known Issues

* [Setting (or obtaining from the child) a too high `radius` (`> size/2`) will mess the shadow.](https://github.com/SrBrahma/react-native-shadow-2/issues/15)
**Update v5:** The radius is now properly limited on the 2nd render and beyond! You may use the safeRender to don't render the shadow until this 2nd render, when the onLayout happens and we get the exact sizes to apply this limit.
