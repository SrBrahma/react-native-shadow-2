# Interface: ShadowI

## Properties

### startColor

• `Optional` **startColor**: `string`

The color of the shadow when it's right next to the given content, leaving it.
Accepts alpha channel.

**`default`** '#00000020'

___

### finalColor

• `Optional` **finalColor**: `string`

The color of the shadow at the maximum distance from the content. Accepts alpha channel.

**`default`** '#0000', transparent.

___

### distance

• `Optional` **distance**: `number`

How far the shadow will go.

**`default`** 10

___

### radius

• `Optional` **radius**: `number` \| { `default?`: `number` ; `topLeft?`: `number` ; `topRight?`: `number` ; `bottomLeft?`: `number` ; `bottomRight?`: `number`  }

The radius of each corner of your child component. Passing a number will apply it to all corners.

If passing an object, undefined corners will have the radius of the `default` property if it's defined.

If undefined and if getChildRadius, it will attempt to get the child radius from the borderRadius style.

Fallbacks to 0.

___

### getChildRadiusStyle

• `Optional` **getChildRadiusStyle**: `boolean`

If it should try to get the radius from the child view **`style`** if `radius` property is undefined. It will get the values for each
corner, like `borderTopLeftRadius`, and also `borderRadius`. If a specific corner isn't defined, `borderRadius` value is used.

**`default`** true

___

### sides

• `Optional` **sides**: (``"left"`` \| ``"right"`` \| ``"top"`` \| ``"bottom"``)[]

The sides of your content that will have the shadows drawn. Doesn't include corners.

**`default`** ['left', 'right', 'top', 'bottom']

___

### corners

• `Optional` **corners**: (``"topLeft"`` \| ``"topRight"`` \| ``"bottomLeft"`` \| ``"bottomRight"``)[]

The corners that will have the shadows drawn.

**`default`** ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']

___

### offset

• `Optional` **offset**: [x: string \| number, y: string \| number]

Moves the shadow. Negative x moves it to the left, negative y moves it up.

Accepts `'x%'` values, in relation to the child's size.

Read `paintInside` property description for related configuration.

**`default`** [0, 0]

___

### paintInside

• `Optional` **paintInside**: `boolean`

If the shadow should be applied inside the external shadows, below the child. `startColor` is used as fill color.

You may want this as true when using offset or if your child have some transparency.

**`default`** false

___

### viewStyle

• `Optional` **viewStyle**: `ViewStyle`

The style of the view that wraps your child component.

If using the `size` property, this wrapping view will automatically receive as style the `size` values and the
radiuses from the `radius` property or from the child, if `getChildRadiusStyle`. You may overwrite those defaults
by undefine'ing the changed styles in this property.

___

### containerViewStyle

• `Optional` **containerViewStyle**: `StyleProp`<`ViewStyle`\>

The style of the view that contains the shadow and your child component.

___

### size

• `Optional` **size**: [width: number, height: number]

If you don't want the 2 renders of the shadow (first applies the relative positioning and sizing that may contain a quick pixel gap, second uses exact pixel size from onLayout) or you are having noticeable gaps/overlaps on the first render,
you can use this property. Using this won't trigger the onLayout, so only 1 render is made.

It will apply the corresponding `width` and `height` styles to the `viewStyle` property.

You may want to set `backgroundColor` in the `viewStyle` property for your child background color.

It's also good if you want an animated view.

The values will be properly rounded using our R() function.
