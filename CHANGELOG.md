## 6.0.6 - 2022-07-21
* Fixed Web Shadow when there are more than one being rendered. [#53](https://github.com/SrBrahma/react-native-shadow-2/issues/53). Many thanks, [@GreyJohnsonGit](https://github.com/GreyJohnsonGit)!

## 6.0.5 - 2022-05-01
* Fixed Android crash when `distance` and a radius are both 0. [#47](https://github.com/SrBrahma/react-native-shadow-2/issues/47). Many thanks, [@Czino](https://github.com/Czino)!

## 6.0.4 - 2022-04-12
* Fixed missed children type when using the new @types/react 18. [#44](https://github.com/SrBrahma/react-native-shadow-2/issues/44). Thanks [@Czino](https://github.com/Czino) and [@hcharley](https://github.com/hcharley)!

## 6.0.3 - 2022-02-11
* Fixed paintInside gaps on iOS. [#36](https://github.com/SrBrahma/react-native-shadow-2/issues/36). Thanks, [@walterholohan](https://github.com/walterholohan)!

## 6.0.2 - 2022-01-26
* Changed `react-native-svg` peerDep version from `'*'` to `'^12.1.0'` to warn users using older and certainly incompatible versions.
* Added `version` export, the package semver version.

## 6.0.1 - 2022-01-16
* Fixed topRight corner using bottomRight radius on its positioning instead its own radius. [#33](https://github.com/SrBrahma/react-native-shadow-2/pull/33). Thanks, [@timqha](https://github.com/timqha)!

## 6.0.0 - 2022-01-03
* Changed finalColor default to **transparent startColor** instead of `#000`. This results in a better gradient when startColor isn't black. [Explanation](https://github.com/SrBrahma/react-native-shadow-2/issues/31#issuecomment-985578972). As this (unlikely) may lead to unexpected visual results in your app, made this version a major.
* Changed shadow wrapping View style from `width: '100%', height: '100%', position: 'absolute',` to `...StyleSheet.absoluteFillObject`. This fixed a strange overflowing shadow on the first render that happened in some specific case.
* Added `pointerEvents='none'` to the shadow wrapping view. Thanks, [OriErel](https://github.com/OriErel)! [#32](https://github.com/SrBrahma/react-native-shadow-2/pull/32)
* Added `shadowViewProps` property to set additional properties to the shadow wrapping view. [#32](https://github.com/SrBrahma/react-native-shadow-2/pull/32)
* **tsconfig** - `module` from `commonjs` to `es6`, `jsx` from `react` to `react-native`, added `esModuleInterop: true`

## 5.1.2 - 2021-11-07
* Changed tsconfig target from `esnext` to `es6`. [#29](https://github.com/SrBrahma/react-native-shadow-2/issues/29)

## 5.1.1 - 2021-10-27
* Fixed the multi-children error being raised when > 1 child but `radius={0}`.

## 5.1.0 - 2021-10-02
* This package now supports [RTL](https://reactnative.dev/blog/2016/08/19/right-to-left-support-for-react-native-apps). [#26](https://github.com/SrBrahma/react-native-shadow-2/issues/26). Thanks [@abdullahkn287](abdullahkn287) and [@serzh-f](https://github.com/serzh-f)!
* [Web] - Removed `shape-rendering: 'crispEdges'` from the SVG parts as since 5.0.0 the Web shadow is pixel perfect (by properly rounding the sizes) and this previous semi-solution is no longer needed.

## 5.0.0 - 2021-09-19
* Renamed `getChildRadiusStyle` property to `getChildRadius`.
* Each corner radius is now limited using [this](https://css-tricks.com/what-happens-when-border-radii-overlap/). The link is for CSS but works in the same way for mobile. [#15](https://github.com/SrBrahma/react-native-shadow-2/issues/15). Thanks for the limit suggestion, [@jimmi-joensson](https://github.com/jimmi-joensson)!
* Added safeRender property to only render on the 2nd render and beyond -- so, no relative rendering on the first render. This is useful when you want a pill/circle like shadow and you are inputting a radius greater than the corresponding sizes. On the future there may be a prop specific for those cases to have them working right on the first render.
* In web looks like it's now completly free from the pixel gaps/overlaps on the 2nd render and beyond!
* Added pointerEvents='box-none' to the container and content views, so clicks/presses go through them and your child may receive them. [#24](https://github.com/SrBrahma/react-native-shadow-2/issues/24). Thanks, [@AdamSheaHewett](https://github.com/AdamSheaHewett)
* Fixed onLayout changes not taking effect when `size` prop was true then switched to false and then a new render was made.


## 4.1.0 - 2021-08-28
* Added `getViewStyleRadius`. [#19](https://github.com/SrBrahma/react-native-shadow-2/issues/19). Thanks [@rbozan](https://github.com/rbozan)!
* Added support for `borderTopStartRadius`, `borderTopEndRadius`, `borderBottomStartRadius`, `borderTopStartRadius` in `getChildRadiusStyle` and in the new `getViewStyleRadius`. Before, only `left, right, top, bottom` combinations were supported.
* Code improvements.
* Added `types` to package.json to display `TypeScript Types` in https://reactnative.directory. - [react-native-community/directory #707](https://github.com/react-native-community/directory/pull/707#issuecomment-906719165). Thanks, [@Simek](https://github.com/Simek)!

### NOTE: `getChildRadiusStyle` will be renamed to `getChildRadius` at the next major.

### Sandbox
* Now using @sharcoux/slider instead of @react-native-community/slider

## 4.0.0 - 2021-08-16
Not too many changes here, but they require a major semver change. It implements [#13](https://github.com/SrBrahma/react-native-shadow-2/issues/13)

* `paintInside` now defaults to true **if** the `offset` property is defined. Else, it keeps its default to false;
* Changed `viewStyle` type from `ViewStyle` to `StyleProp<ViewStyle>`. Thanks, [jimmi-joensson](https://github.com/jimmi-joensson)!
* Renamed ShadowI to ShadowProps

## 3.0.0 - 2021-07-17

* **Shadow with automatic size is applied on the same render!**. Lib rewritten to allow it. 1 month of pure suffering and despair trying to find new html/svg/react hacks to do what I wanted. :') #7, #8, #9,
* Now it works on Web (React Native Web / Expo)
* Added `getChildRadius` prop.
* Added `paintInside` prop.
* Added `viewStyle` prop.
* Removed `contentViewStyle` prop.
* Changed default `startColor` from `'#00000010'` to `'#00000020'`, so it's more noticeable when first trying the lib.
* Looks like the pixel gaps/overlaps are all solved. It was a very long and frustrating marathon to achieve this!
* [code] Added a partial README filler, using [this](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/59#issuecomment-867300957) (mine!)
* Added Sandbox! Used it a lot while developing this lib.
* Changed minor functionalities
* Minor fixes

> We are calling this 3.0.0 because 2.0.0 would be ambiguous. One could think that the 1.0.0 is a reference to the original react-native-shadow package and the 2.0.0 would just be the react-native-shadow-2.


### 1.1.1 - 2021-03-23

* Fixed sides shadow position when not having top/left side shadow.

## 1.1.0 - 2021-03-06

* Added offset
