<div align="center">

[![npm](https://img.shields.io/npm/v/react-native-shadow-2)](https://www.npmjs.com/package/react-native-shadow-2)
[![TypeScript](https://badgen.net/npm/types/env-var)](http://www.typescriptlang.org/)
[![npm](https://img.shields.io/npm/dt/react-native-shadow-2)](https://www.npmjs.com/package/react-native-shadow-2)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

</div>

# react-native-shadow-2

[react-native-shadow](https://github.com/879479119/react-native-shadow) is dead for years. This is an improved version with more functionalities, Typescript support and written from scratch. It's not required to define its size: the shadow is smartly applied on the first render and then precisely reapplied on the following ones.

It solves the old React Native issue of not having the same shadow appearence and usage for Android, iOS and Web.

The [ethercreative/react-native-shadow-generator](https://ethercreative.github.io/react-native-shadow-generator) website won't give you very similar results between the two platforms, for the reasons I described [here](https://github.com/ethercreative/react-native-shadow-generator/issues/2#issuecomment-738130722). It's also not as customizable as this library.

Compatible with Android, iOS and Web. **And Expo!**

Supports [RTL](https://reactnative.dev/blog/2016/08/19/right-to-left-support-for-react-native-apps).

<!--<div align="center">
  <h3>📣 I AM AVAILABLE FOR HIRE! 📣</h3>
  <a href="https://www.linkedin.com/in/henrique-bfa">Contact me</a> if you need a remote mid-level React Native developer!
</div>-->

## [🍟 Demo - Expo Snack Sandbox](https://snack.expo.io/@srbrahma/react-native-shadow-2-sandbox)
> Give this library a quick try!

## [📰 v7 Changelog - 2022-08-08](./CHANGELOG.md)
> **There are important breaking changes! Read it if upgrading!**

### [↪️ Pre v7 Readme](https://github.com/SrBrahma/react-native-shadow-2/blob/36d123db4cf816d15ac5e3f9c9df8cff3e96bd2e/README.md)
> Old Readme, if you are still using previous versions.

### [❗ Read the FAQ below!](#️-faq)

## 💿 Installation

#### 1. First install [react-native-svg](https://github.com/react-native-svg/react-native-svg#installation).

> The latest `react-native-svg` version is recommended, including if using Expo.

#### 2. Then install react-native-shadow-2:

```bash
npm i react-native-shadow-2
# or
yarn add react-native-shadow-2
```


## 📖 Usage

```tsx
import { Shadow } from 'react-native-shadow-2';

<Shadow>
  <Text style={{ margin: 20, fontSize: 20 }}>🙂</Text>
</Shadow>
```

![Example 1](./resources/README/react-native-shadow-2-ex-1.png)

<br/>

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
| Property | Description | Type | Default
| --- | --- | --- | ---
| **startColor** | The initial gradient color of the shadow. | `string` | `'#00000020'`
| **endColor** | The final gradient color of the shadow. | `string` | Transparent startColor. [Explanation](https://github.com/SrBrahma/react-native-shadow-2/issues/31#issuecomment-985578972)
| **distance** | How far the shadow goes. | `number` | `10`
| **offset** | Moves the shadow. Negative `x` moves it left/start, negative `y` moves it up.<br/><br/>Accepts `'x%'` values.<br/><br/>Defining this will default `paintInside` to **true**, as it's the usual desired behaviour. | `[x: string \| number, y: string \| number]` | `[0, 0]`
| **paintInside** | Apply the shadow below/inside the content. `startColor` is used as fill color, without a gradient.<br/><br/>Useful when using `offset` or if your child has some transparency. | `boolean` | `false`, but `true` if `offset` is defined
| **sides** | The sides that will have their shadows drawn. Doesn't include corners. Undefined sides fallbacks to **true**. | `Record<'start' \| 'end' \| 'top' \| 'bottom', boolean>` | `undefined`
| **corners** | The corners that will have their shadows drawn. Undefined corners fallbacks to **true**. | `Record<'topStart' \| 'topEnd' \| 'bottomStart' \| 'bottomEnd', boolean>` | `undefined`
| **style** | The style of the View that wraps your children. Read the [Notes](https://github.com/SrBrahma/react-native-shadow-2/edit/main/README.md#notes) below. | `StyleProp<ViewStyle>` | `undefined`
| **containerStyle** | The style of the View that wraps the Shadow and your children. Useful for margins. | `StyleProp<ViewStyle>` | `undefined`
| **stretch** | Make your children ocuppy all available horizontal space. [Explanation](https://github.com/SrBrahma/react-native-shadow-2/issues/7#issuecomment-899784537). | `boolean` | `false`
| **safeRender** | Won't use the relative sizing and positioning on the 1st render but on the following renders with the exact onLayout sizes. Useful if dealing with radii greater than the sides sizes (like a circle) to avoid visual artifacts on the 1st render.<br/><br/>If `true`, the Shadow won't appear on the 1st render. | `boolean` | `false`
| **disabled** | Disables the Shadow. Useful for easily reusing components as sometimes shadows are not desired.<br/><br/>`containerStyle` and `style` are still applied. | `boolean` | `false`

## Notes

* If the Shadow has a single child, it will get the `width`, `height` and all of the `borderRadius` properties from the children's `style` property, if defined.

* You may also define those properties in the Shadow's `style`. The defined properties here will have priority over the ones defined in the child's `style`.

* If the `width` **and** `height` are defined in any of those, there will be only a single render, as the first automatic sizing won't happen, only the precise render.

* You can use either the `'borderTopLeftRadius'` or `'borderTopStartRadius'` and their variations to define the corners radii, although I recommend the latter as it's the RTL standard.

* [Having a radius greater than its side will mess the shadow if the sizes aren't defined](https://github.com/SrBrahma/react-native-shadow-2/issues/15). **You can use the `safeRender` property** to only show the shadow on the 2nd render and beyond, when we have the exact component size and the radii are properly limited.

* [Radii greater than 2000 (Tailwind's `rounded-full` is 9999) may crash Android](https://github.com/SrBrahma/react-native-shadow-2/issues/46).
<!-- Seems hard to understand. Will leave it undoc'ed until I improve it. -->
<!-- * We automatically set the radii in the `style` property, so it contains the Child's Android Ripple if you are using it. We already get those values, so it isn't an effort to set them. -->

## ⁉️ FAQ

* #### How to set the Shadow opacity?

  The opacity is set directly in the `startColor` and `endColor` properties, in the alpha channel. E.g.: `'#0001'` is an almost transparent black. You may also use `'#rrggbbaa'`, `'rgba()'`, `'hsla()'` etc. [All patterns in this link, but not int colors, are accepted](https://reactnative.dev/docs/colors).


* #### My component is no longer using the available parent width after applying the Shadow! What to do?

  Use the `stretch` property or `style={{alignSelf: 'stretch'}}` in your Shadow component. [Explanation](https://github.com/SrBrahma/react-native-shadow-2/issues/7#issuecomment-899764882)!


* #### I want a preset for my Shadows!

  It's exported the `ShadowProps` type, the props of the Shadow component. You may do the following:
  ```tsx
  const ShadowPresets = {
    button: {
      offset: [0, 1], distance: 1, startColor: '#0003',
    } as ShadowProps,
  };

  <Shadow {...ShadowPresets.button}>
  ```

* #### The `offset` and `size` properties are throwing Typescript errors!

  Upgrade your Typescript to at least 4.0.0! Those two properties use [**labeled tuples**](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#labeled-tuple-elements). If you don't use Typescript, this won't happen.


<!-- Commented until improved ## Performance Guide 

> While you usually won't have any performance issues by using this, you may have performance issues if you have many Shadows in your screen, like in a FlatList. Those may help you to improve your performance:

* In `style` and on child's `style`, avoid using inline styles (eg `{{flex: 1}}`). Prefer using styles from `StyleSheet.create`. If you are using arrays for the styles (eg `style={[styles.view, {flex: 1}]}`), have this array creation outside the component or inside an `useMemo`, so it isn't unnecessarily created a new reference at each render and we can better memoize the Shadow.

-->

## 📰 Popularly seen on
* ### [LogRocket - Applying box shadows in React Native](https://blog.logrocket.com/applying-box-shadows-in-react-native/)
* ### [V. Petrachin - Top 10 Libraries You Should Know for React Native in 2022](https://viniciuspetrachin.medium.com/top-10-libraries-you-should-know-for-react-native-d435e5209c96)
