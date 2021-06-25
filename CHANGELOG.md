### 3.0.0 - 2021/06/25


* Now it works in Web env (React Native Web / Expo)
* Removed `size` prop and the shadow is applied on the same render. I rewrote the lib almost completely to add those awesome capabilities.
* Added `getChildRadius` prop.
* Added `paintInside` prop.
* Removed `contentViewStyle`. Only `containerViewStyle` now exists. Inform me if you need it.
* Changed default `startColor` from `'#00000010'` to `'#00000020'`, so it's more noticeable when first trying the lib.
* The pixel gap that sometimes would appear it's now probably fixed for good.
* [code] Added a partial README filler, using [this](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/59#issuecomment-867300957) (it's mine!)

> We are calling this 3.0.0 because 2.0.0 would be ambiguous. One could think that the 1.0.0 is a reference to the original react-native-shadow package and the 2.0.0 would just be the react-native-shadow-2.


### 1.1.1 - 2021/03/23

* Fixed sides shadow position when not having top/left side shadow.

## 1.1.0 - 2021/03/06

* Added offset