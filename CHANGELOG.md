### 3.0.0 - 2021/06/25


* Removed `size` prop and the shadow is applied on the same render. I rewrote the lib almost completely to add those **awesome** capabilities. 2 weeks of pure suffering and despair trying to find new html/svg/react hacks to do what I wanted. :')
* Now it works on Web (React Native Web / Expo)
* Added `getChildRadius` prop.
* Added `paintInside` prop.
* Removed `contentViewStyle`. Only `containerViewStyle` now exists.
* Changed default `startColor` from `'#00000010'` to `'#00000020'`, so it's more noticeable when first trying the lib. Maybe later I will add
* Looks like the pixel gaps/overlaps are all solved. It was a very long and frustrating marathon to achieve this!
* [code] Added a partial README filler, using [this](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/59#issuecomment-867300957) (it's mine!)

> We are calling this 3.0.0 because 2.0.0 would be ambiguous. One could think that the 1.0.0 is a reference to the original react-native-shadow package and the 2.0.0 would just be the react-native-shadow-2.


### 1.1.1 - 2021/03/23

* Fixed sides shadow position when not having top/left side shadow.

## 1.1.0 - 2021/03/06

* Added offset