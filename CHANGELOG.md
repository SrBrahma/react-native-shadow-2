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