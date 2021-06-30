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

The color of the shadow at the maximum distance from the content.

**`default`** '#0000', transparent.

___

### distance

• `Optional` **distance**: `number`

How far the shadow will go.

**`default`** 10

___

### containerViewStyle

• `Optional` **containerViewStyle**: `StyleProp`<`ViewStyle`\>

The style of the view that contains the shadow and the children.

**`default`** undefined

___

### radius

• `Optional` **radius**: `number` \| { `default?`: `number` ; `topLeft?`: `number` ; `topRight?`: `number` ; `bottomLeft?`: `number` ; `bottomRight?`: `number`  }

The radius of each corner of your child component. Passing a number will apply it to all corners.

If passing an object, undefined corners will have the radius of the `default` property if it's defined.

If undefined and if getChildRadius, it will attempt to get the child radius from the borderRadius style.

Fallbacks to 0.

**`default`** undefined

___

### getChildRadius

• `Optional` **getChildRadius**: `boolean`

If it should try to get the radius from the child if `radius` prop is undefined. It will get the values for each
corner, like `borderTopLeftRadius`, and also `borderRadius`. If a specific corner isn't defined, `borderRadius` value is used.
If `borderRadius` isn't defined or < 0, 0 will be used.

**`default`** true

___

### sides

• `Optional` **sides**: `Side`[]

The sides of your content that will have the shadows drawn. Doesn't include corners.

**`default`** ['left', 'right', 'top', 'bottom']

___

### corners

• `Optional` **corners**: `Corner`[]

The corners that will have the shadows drawn.

**`default`** ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']

___

### offset

• `Optional` **offset**: [x: string \| number, y: string \| number]

Moves the shadow. Negative x moves it to the left, negative y moves it up.

Accepts 'x%' values, in relation to the child's size.

Read paintInside property description for related configuration.

**`default`** [0, 0]

___

### paintInside

• `Optional` **paintInside**: `boolean`

If the shadow should be applied inside the external shadows, below the child.

You may want this as true when using offset or if your child have some transparency.

**`default`** false
