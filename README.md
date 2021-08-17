<div align="center">

[![npm](https://img.shields.io/npm/v/react-native-shadow-2)](https://www.npmjs.com/package/react-native-shadow-2)
[![TypeScript](https://badgen.net/npm/types/env-var)](http://www.typescriptlang.org/)
[![npm](https://img.shields.io/npm/dw/react-native-shadow-2)](https://www.npmjs.com/package/react-native-shadow-2)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

</div>


# react-native-shadow-2

[react-native-shadow](https://github.com/879479119/react-native-shadow) is dead for years. This one is an improved version with more functionalities, Typescript support and written from scratch. Also, it doesn't require the usage of the `size` property.

It solves the old React Native issue of not having the same shadow appearence and implementation for Android, iOS and Web.

The [ethercreative/react-native-shadow-generator](https://ethercreative.github.io/react-native-shadow-generator) website won't give you very similar results between the two platforms, for the reasons I described [here](https://github.com/ethercreative/react-native-shadow-generator/issues/2#issuecomment-738130722), when I started to think about the solution to this shadow issue.

Compatible with Android, iOS and Web. **And Expo!**

Implementation: [./src/index.tsx](./src/index.tsx)

## [🍟 Expo Snack Sandbox](https://snack.expo.io/@srbrahma/react-native-shadow-2-sandbox)


## 🥳 New version 3.0.0! (2021-07-17) 🥳

### The long waited and most wanted feature is out!

Before this new version, it was required to manually enter your component size or leave it as undefined and the integrated onLayout would get its size and apply the shadow on the next render.

Now, **the shadow is smartly applied on the same render without entering its size!**


## 💿 Installation

### 1. First install [react-native-svg](https://github.com/react-native-svg/react-native-svg).

### 2. Then install react-native-shadow-2:

```bash
npm i react-native-shadow-2
# or
yarn add react-native-shadow-2
```


## 📖 Usage

### Structure
```tsx
import { Shadow } from 'react-native-shadow-2';

<Shadow>
   {/* Your component */}
</Shadow>
```

### Basic
```tsx
<Shadow>
  <View>
    <Text style={{ margin: 20, fontSize: 20 }}>🙂</Text>
  </View>
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

<!--$shadowProperties-->

| Property | Type | Default | Description
| --- | --- | --- | ---
| **startColor** | `string` | `'#00000020'` | The color of the shadow when it's right next to the given content, leaving it. Accepts alpha channel.
| **finalColor** | `string` | `'#0000', transparent.` | The color of the shadow at the maximum distance from the content. Accepts alpha channel.
| **distance** | `number` | `10` | How far the shadow will go.
| **radius** | `number \| { default?: number ; topLeft?: number ; topRight?: number ; bottomLeft?: number ; bottomRight?: number  }` | `undefined` | The radius of each corner of your child component. Passing a number will apply it to all corners.<br/><br/>If passing an object, undefined corners will have the radius of the `default` property if it's defined.<br/><br/>If undefined and if getChildRadius, it will attempt to get the child radius from the borderRadius style.<br/><br/>Each corner fallbacks to 0.
| **getChildRadiusStyle** | `boolean` | `true` | If it should try to get the radius from the child view **`style`** if `radius` property is undefined. It will get the values for each corner, like `borderTopLeftRadius`, and also `borderRadius`. If a specific corner isn't defined, `borderRadius` value is used.
| **sides** | `("left" \| "right" \| "top" \| "bottom")[]` | `['left', 'right', 'top', 'bottom']` | The sides of your content that will have the shadows drawn. Doesn't include corners.
| **corners** | `("topLeft" \| "topRight" \| "bottomLeft" \| "bottomRight")[]` | `['topLeft', 'topRight', 'bottomLeft', 'bottomRight']` | The corners that will have the shadows drawn.
| **offset** | `[x: string \| number, y: string \| number]` | `[0, 0]` | Moves the shadow. Negative x moves it to the left, negative y moves it up.<br/><br/>Accepts `'x%'` values, in relation to the child's size.<br/><br/>Setting an offset will default `paintInside` to true, as it is the usual desired behaviour.
| **paintInside** | `boolean` | `false` | If the shadow should be applied inside the external shadows, below the child. `startColor` is used as fill color.<br/><br/>You may want this as true when using offset or if your child have some transparency.<br/><br/>**The default changes to true if `offset` property is defined.**
| **viewStyle** | `ViewStyle` | `undefined` | The style of the view that wraps your child component.<br/><br/>If using the `size` property, this wrapping view will automatically receive as style the `size` values and the radiuses from the `radius` property or from the child, if `getChildRadiusStyle`. You may overwrite those defaults by undefine'ing the changed styles in this property.
| **containerViewStyle** | `StyleProp<ViewStyle>` | `undefined` | The style of the view that contains the shadow and your child component.
| **size** | `[width: number, height: number]` | `undefined` | If you don't want the 2 renders of the shadow (first applies the relative positioning and sizing that may contain a quick pixel gap, second uses exact pixel size from onLayout) or you are having noticeable gaps/overlaps on the first render, you can use this property. Using this won't trigger the onLayout, so only 1 render is made.<br/><br/>It will apply the corresponding `width` and `height` styles to the `viewStyle` property.<br/><br/>You may want to set `backgroundColor` in the `viewStyle` property for your child background color.<br/><br/>It's also good if you want an animated view.<br/><br/>The values will be properly rounded using our R() function.

<!--/$shadowProperties-->

## ⁉️ FAQ

**Q**: How to set the Shadow opacity?

**A**: The opacity in react-native-shadow-2, differently from the original version, is set directly at the `startColor` and `finalColor` properties, in the alpha channel. E.g.: `'#0001'` would be an almost transparent black. You may also use `'rgba()'`, `'hsla()'` etc.


**Q**: [My component is no longer using the available parent width after applying the Shadow! What to do?](https://github.com/SrBrahma/react-native-shadow-2/issues/7#issuecomment-899764882)

**A**: Use `viewStyle={{alignSelf: undefined}}` or `'stretch'` instead of undefined in your Shadow component. Read the link above to understand why!


**Q**: I want a preset for my Shadows, so I don't have to type the same props among them and I want to quickly change them all if I want to!

**A**: This package exports the `ShadowProps` type, that are the props of the Shadow component. I am for example using the following:
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


## 🐛 Notes / Known Issues

* Setting (or obtaining from the child) a too high `radius` (`> size/2`) will mess the shadow.

* **`[Mobile]`** The shadow, since v3, will be applied on the first render even if no size is passed to it, as we now magically use relative positioning and sizing.
There may be a pixel wide gap on the first render on the right and bottom SVG parts connections, due to how React Native and react-native-svg handles percentage sizings and roundings. It's fixed automatically
on the following render, as this lib will get the exact pixel size of the child component using onLayout.
This gap won't always happen and it's usually hardly noticeable.
If you don't want to this to happen at all, you can use the `size` property.

* **`[Web]`** If your child is manually set to have a decimal size, there may be a pixel wide gap between your child component and the right/bottom shadow, as browsers usually allow decimal sizings and it will blur the last pixel line/row.
You can either fix it by using the `paintInside` property to hide this possible imperfection or use the `size` property to avoid it from happening.

## 📰 [Changelog](./CHANGELOG.md)

## 🦉 Alternatives
* [react-native-neomorph-shadows](https://github.com/tokkozhin/react-native-neomorph-shadows) looks great and has different possibilities. But, it doesn't support shadow on the same render if not defining the size, and it doesn't support Expo.
