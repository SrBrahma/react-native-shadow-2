import React, { useMemo, useState } from 'react';
import { I18nManager, PixelRatio, Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Defs, LinearGradient, Mask, Path, RadialGradient, Rect, Stop, Svg } from 'react-native-svg';
import { parseToRgb, rgbToColorString, transparentize } from 'polished'; // To extract alpha
import type { RgbaColor } from 'polished/lib/types/color';
import { Corner, CornerRadius, CornerRadiusShadow, cornerToStyle, objFromKeys, Side } from './utils';



const isWeb = Platform.OS === 'web';

/** Rounds the given size to a pixel perfect size. */
export function R(value: number): number {
  // In Web, 1dp=1px. But it accepts decimal sizes, and it's somewhat problematic.
  // The size rounding is browser-dependent, so we do the decimal rounding for web by ourselves to have a
  // consistent behavior. We floor it, because it's better for the child to overlap by a pixel the right/bottom shadow part
  // than to have a pixel wide gap between them.
  if (isWeb)
    return Math.floor(value);

  return PixelRatio.roundToNearestPixel(value);
}
/** Converts dp to pixels. */
function P(value: number) {
  if (isWeb) return value;
  return PixelRatio.getPixelSizeForLayoutSize(value);
}
/** How many pixels for each dp. scale = pixels/dp */
const scale = isWeb ? 1 : PixelRatio.get();

/** Converts two sizes to pixel for perfect math, sum them and converts the result back to dp. */
function sumDps(a: number, b: number) {
  if (isWeb) return a + b;
  return R((P(a) + P(b)) / scale);
}

/** [Android/ios?] [*4] A small safe margin for the svg sizes.
 *
 * It fixes some gaps that we had, as even that the svg size and the svg rect for example size were the same, this rect
 * would still strangely be cropped/clipped. We give this additional size to the svg so our rect/etc won't be unintendedly clipped.
 *
 * It doesn't mean 1 pixel, as RN uses dp sizing, it's just an arbitrary and big enough number. */
const additional = isWeb ? 0 : 1;

const cornersArray = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const;
// const cornersShadowArray = ['topLeftShadow', 'topRightShadow', 'bottomLeftShadow', 'bottomRightShadow'] as const;
const sidesArray = ['left', 'right', 'top', 'bottom'] as const;




export interface ShadowProps {
  /** The color of the shadow when it's right next to the given content, leaving it.
   * Accepts alpha channel.
   *
   * @default '#00000020' */
  startColor?: string;
  /** The color of the shadow at the maximum distance from the content. Accepts alpha channel.
   *
   * It defaults to a transparent color of `startColor`. E.g.: `startColor` is `#f00`, so it defaults to `#f000`. [Reason here](https://github.com/SrBrahma/react-native-shadow-2/issues/31#issuecomment-985578972).
   *
   * @default Transparent startColor */
  finalColor?: string;
  /** How far the shadow will go.
   * @default 10 */
  distance?: number;
  /** The radius of each corner of your child component. Passing a number will apply it to all corners.
   *
   * If passing an object, undefined corners will have the radius of the `default` property if it's defined.
   *
   * If undefined and if getChildRadius, it will attempt to get the child radius from the borderRadius style.
   *
   * Each corner fallbacks to 0. */
  radius?: number | { default?: number; topLeft?: number; topRight?: number; bottomLeft?: number; bottomRight?: number};
  /** If it should try to get the radius from the child view **`style`** if `radius` property is undefined. It will get the values for each
   * corner, like `borderTopLeftRadius`, and also `borderRadius`. If a specific corner isn't defined, `borderRadius` value is used.
   *
   * If **`getViewStyleRadius`**, the corners defined in viewStyle will have priority over child's style.
   *
   * @default true */
  getChildRadius?: boolean;
  /** If it should try to get the radius from the **`viewStyle`** property if `radius` property is undefined. It will get the values for each
   * corner, like `borderTopLeftRadius`, and also `borderRadius`. If a specific corner isn't defined, `borderRadius` value is used.
   *
   * If **`getChildRadius`**, the corners defined in viewStyle will have priority over child's style.
   * @default true */
  getViewStyleRadius?: boolean;
  // TODO getChildSizeStyle?: boolean;
  /** The sides of your content that will have the shadows drawn. Doesn't include corners.
   *
   * @default ['left', 'right', 'top', 'bottom'] */
  // We are using the raw type here instead of Side/Corner so TypeDoc/Readme output is better for the users, won't be just `Side`.
  sides?: ('left' | 'right' | 'top' | 'bottom')[];
  /** The corners that will have the shadows drawn.
   *
   * @default ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] */
  corners?: ('topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight')[];
  /** Moves the shadow. Negative x moves it to the left, negative y moves it up.
   *
   * Accepts `'x%'` values, in relation to the child's size.
   *
   * Setting an offset will default `paintInside` to true, as it is the usual desired behaviour.
   *
   * @default [0, 0] */
  offset?: [x: number | string, y: number | string];
  /** If the shadow should be applied inside the external shadows, below the child. `startColor` is used as fill color.
   *
   * You may want this as true when using offset or if your child have some transparency.
   *
   * **The default changes to true if `offset` property is defined.**
   *
   * @default false */
  paintInside?: boolean;
  /** The style of the view that wraps your child component.
   *
   * If using the `size` property, this wrapping view will automatically receive as style the `size` values and the
   * radiuses from the `radius` property or from the child, if `getChildRadius`. You may overwrite those defaults
   * by undefine'ing the changed styles in this property. */
  viewStyle?: StyleProp<ViewStyle>;
  /** The style of the view that contains the shadow and your child component. */
  containerViewStyle?: StyleProp<ViewStyle>;
  /** The style of the view wrapping the shadow component. You shouldn't need to use this. */
  shadowViewStyle?: StyleProp<ViewStyle>;
  /** If it should try to get the `width` and `height` from the child **style** if `size` prop is undefined.
   *
   * If the size style is found, it won't use the onLayout strategy to get the child style after its render.
   * @default true */
  /** If you don't want the 2 renders of the shadow (first applies the relative positioning and sizing that may contain a quick pixel gap, second uses exact pixel size from onLayout) or you are having noticeable gaps/overlaps on the first render,
   * you can use this property. Using this won't trigger the onLayout, so only 1 render is made.
   *
   * It will apply the corresponding `width` and `height` styles to the `viewStyle` property.
   *
   * You may want to set `backgroundColor` in the `viewStyle` property for your child background color.
   *
   * It's also good if you want an animated view.
   *
   * The values will be properly rounded using our R() function. */
  size?: [width: number, height: number];
  // /** If the shadow will move to its inner side instead of going out.
  //  *
  //  * @default false */
  // inset?: boolean;
  /** If you don't want the relative sizing and positioning of the shadow on the first render, but only on the second render and
   * beyond with the exact onLayout sizes. This is useful if dealing with radius greater than the sizes, to assure
   * the fully round corners when the sides sizes are unknown and to avoid weird and overflowing shadows on the first render.
   *
   * Note that when true, the shadow will only appear on the second render and beyond, when the sizes are known with onLayout.
   *
   * @default false */
  safeRender?: boolean;
}


export const Shadow: React.FC<ShadowProps> = ({
  radius: radiusProp,
  sides: sidesProp = ['left', 'right', 'top', 'bottom'],
  corners: cornersProp = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'],
  containerViewStyle,
  shadowViewStyle,
  startColor: startColorProp = '#00000020',
  finalColor: finalColorProp = transparentize(1, startColorProp),
  distance: distanceProp = 10,
  children,
  size: sizeProp, // Do not default here. We do `if (sizeProp)` on onLayout.
  offset,
  getChildRadius = true,
  getViewStyleRadius = true,
  paintInside: paintInsideProp,
  viewStyle,
  safeRender = false,
}) => {
  const isRTL = I18nManager.isRTL;

  const [childWidth, setChildWidth] = useState<number | undefined>();
  const [childHeight, setChildHeight] = useState<number | undefined>();

  /** Defaults to true if offset is defined, else defaults to false */
  const paintInside = paintInsideProp ?? (offset ? true : false);
  const [offsetX, offsetY] = offset ?? [0, 0];

  const distance = R(Math.max(distanceProp, 0)); // Min val as 0
  /** Read {@link additional}, [*4] */
  const distanceWithAdditional = distance + additional;
  const width = (sizeProp ? R(sizeProp[0]) : childWidth) ?? '100%'; // '100%' sometimes will lead to gaps. child size don't lie.
  const height = (sizeProp ? R(sizeProp[1]) : childHeight) ?? '100%';
  /** Will (+ additional), only if its value isn't '100%'. */
  const widthWithAdditional = typeof width === 'string' ? width : width + additional;
  /** Will (+ additional), only if its value isn't '100%'. */
  const heightWithAdditional = typeof height === 'string' ? height : height + additional;


  const radii: CornerRadius = useMemo(() => {

    /** Not yet treated. May be negative / undefined */
    const cornerRadiusPartial: Partial<CornerRadius> = (() => {
      if (radiusProp !== undefined) {
        if (typeof radiusProp === 'number')
          return objFromKeys(cornersArray, () => radiusProp);
        else
          return objFromKeys(cornersArray, (k) => radiusProp[k] ?? radiusProp.default);
      }

      /** We have to merge both viewStyle and childStyle with care. A bottomLeftBorderRadius in childStyle for eg shall not replace
       * borderRadius in viewStyle.
       *
       * Props inits as undefined so in getChildRadius we can Object.values check for undefined. */
      // Map type to undefined union instead of Partial as Object.values don't treat optional as | undefined. Keeps this type-safe.
      let mergedStyle: Record<Corner, number | undefined> = { bottomLeft: undefined, bottomRight: undefined, topLeft: undefined, topRight: undefined };

      if (getViewStyleRadius) {
        const mergedViewStyle = StyleSheet.flatten(viewStyle ?? {}); // Convert possible array style to a single obj style.
        mergedStyle = objFromKeys(cornersArray, (k) => mergedViewStyle[cornerToStyle(k, false)] ?? mergedViewStyle[cornerToStyle(k, true)] ?? mergedViewStyle?.borderRadius) as Record<Corner, number | undefined>;
      }

      // Only enter block if there is a undefined corner that may now be defined;
      if (getChildRadius && Object.values(mergedStyle).includes(undefined)) {
        if (React.Children.count(children) > 1)
          throw new Error('Only single child is accepted in Shadow component with getChildRadius={true} (default value). You should wrap it in a View or change this property to false and manually enter the borderRadius in the radius property.');
        /** May be an array of styles. */
        const childStyleTemp: ViewStyle | undefined = ((React.Children.only(children) as JSX.Element | undefined)?.props?.style);
        const childStyle = StyleSheet.flatten(childStyleTemp ?? {}); // Convert possible array style to a single obj style.
        mergedStyle = objFromKeys(cornersArray, (k) =>
          mergedStyle[k] ?? // Don't overwrite viewStyle already defined radiuses.
          childStyle[cornerToStyle(k, false)] ?? childStyle[cornerToStyle(k, true)] ?? childStyle?.borderRadius) as Record<Corner, number | undefined>;
      }

      return mergedStyle;
    })();


    /** Round and zero negative radius values */
    const radiiPreSizeLimit = objFromKeys(cornersArray, (k) => R(Math.max(cornerRadiusPartial[k] ?? 0, 0)));

    let result = radiiPreSizeLimit;

    if (typeof width === 'number' && typeof height === 'number') {
      // https://css-tricks.com/what-happens-when-border-radii-overlap/
      // Note that the tutorial above doesn't mention the specification of minRatio < 1 but it's required as said on spec and will malfunction without it.
      const minRatio = Math.min( // 'x / 0 = Infinity' is js, not a problem here.
        width / (radiiPreSizeLimit.topLeft + radiiPreSizeLimit.topRight), // top
        height / (radiiPreSizeLimit.topRight + radiiPreSizeLimit.bottomRight), // right
        width / (radiiPreSizeLimit.bottomLeft + radiiPreSizeLimit.bottomRight), // bottom
        height / (radiiPreSizeLimit.topLeft + radiiPreSizeLimit.bottomLeft), // left
      );
      if (minRatio < 1)
        result = objFromKeys(cornersArray, (k) => R(radiiPreSizeLimit[k] * minRatio));
    }

    return result;
  }, [children, getChildRadius, getViewStyleRadius, height, radiusProp, viewStyle, width]);


  const shadow = useMemo(() => {

    // Skip if using safeRender and we still don't have the exact sizes, if we are still on the first render using the relative sizes.
    if (safeRender && (typeof width === 'string' || typeof height === 'string'))
      return null;

    // polished vs 'transparent': https://github.com/styled-components/polished/issues/566. Maybe tinycolor2 would allow it.
    const startColor = startColorProp === 'transparent' ? '#0000' : startColorProp;
    const finalColor = finalColorProp === 'transparent' ? '#0000' : finalColorProp;

    const startColorRgb = parseToRgb(startColor) as Omit<RgbaColor, 'alpha'> & { alpha?: number };
    const finalColorRgb = parseToRgb(finalColor) as Omit<RgbaColor, 'alpha'> & { alpha?: number };

    // [*1]: Seems that SVG in web accepts opacity in hex color, but in mobile doesn't.
    // So we remove the opacity from the color, and only apply the opacity in stopOpacity, so in web
    // it isn't applied twice.
    const startColorWoOpacity = rgbToColorString({ ...startColorRgb, alpha: undefined }); // overwrite alpha
    const finalColorWoOpacity = rgbToColorString({ ...finalColorRgb, alpha: undefined });

    const startColorOpacity = startColorRgb.alpha ?? 1;
    const finalColorOpacity = finalColorRgb.alpha ?? 1;

    const { topLeft, topRight, bottomLeft, bottomRight } = radii;

    const cornerShadowRadius: CornerRadiusShadow = { // Not using objFromKeys here as the key is different
      topLeftShadow: sumDps(topLeft, distance),
      topRightShadow: sumDps(topRight, distance),
      bottomLeftShadow: sumDps(bottomLeft, distance),
      bottomRightShadow: sumDps(bottomRight, distance),
    };

    const { topLeftShadow, topRightShadow, bottomLeftShadow, bottomRightShadow } = cornerShadowRadius;

    /** Which sides will have shadow. */
    const activeSides: Record<Side, boolean> = objFromKeys(sidesArray, (k) => sidesProp.includes(k));

    /** Which corners will have shadow. */
    const activeCorners: Record<Corner, boolean> = objFromKeys(cornersArray, (k) => cornersProp.includes(k));

    // Fragment wasn't working for some reason, so, using array.
    const linearGradient = [
      // [*1] In mobile, it's required for the alpha to be set in opacity prop to work.
      // In web, smaller offsets needs to come before, so offset={0} definition comes first.
      <Stop offset={0} stopColor={startColorWoOpacity} stopOpacity={startColorOpacity} key='1'/>,
      <Stop offset={1} stopColor={finalColorWoOpacity} stopOpacity={finalColorOpacity} key='2'/>,
    ];

    function radialGradient(id: string, top: boolean, left: boolean, radius: number, shadowRadius: number) {
      return (<RadialGradient
        id={id}
        cx={left ? shadowRadius : 0}
        cy={top ? shadowRadius : 0}
        r={shadowRadius}
        gradientUnits='userSpaceOnUse' // won't show if this isn't set
      >
        {/* <Stop offset={radius / shadowRadius} stopOpacity={0}/> // Bad. There would be a tiny gap between the child and the corner shadow. */}
        <Stop offset={radius / shadowRadius} stopColor={startColorWoOpacity} stopOpacity={startColorOpacity}/>
        <Stop offset={1} stopColor={finalColorWoOpacity} stopOpacity={finalColorOpacity}/>
      </RadialGradient>);
    }


    return (<>
      {/* Sides */}

      {/* shape-rendering fixes some gaps on web. Not available on Android/iOS, but won't affect them.
          We use shapeRendering, but React converts it to shape-rendering. Else, it would work but throw some console errors.
          It don't actually exists in react-native-svg, but the prop is passed anyway. Else, there probably wouldn't be a solution for web for the gaps!
          We do the {...{shape[...]}} else TS would complain that this prop isn't accepted. */}
      {activeSides.left && <Svg
        width={distanceWithAdditional} height={heightWithAdditional}
        style={{ position: 'absolute', left: -distance, top: topLeft, ...(isRTL && { transform: [{ scaleX: -1 }] }) }}
      >
        <Defs><LinearGradient id='left' x1='1' y1='0' x2='0' y2='0'>{linearGradient}</LinearGradient></Defs>
        {/* I was using a Mask here to remove part of each side (same size as now, sum of related corners), but,
          just moving the rectangle outside its viewbox is already a mask!! -> svg overflow is cutten away. <- */}
        <Rect width={distance} height={height} fill='url(#left)' y={-sumDps(topLeft, bottomLeft)}/>
      </Svg>
      }
      {activeSides.right && <Svg
        width={distanceWithAdditional} height={heightWithAdditional}
        style={{ position: 'absolute', left: width, top: topRight, ...(isRTL && { transform: [{ scaleX: -1 }] }) }}
      >
        <Defs><LinearGradient id='right' x1='0' y1='0' x2='1' y2='0'>{linearGradient}</LinearGradient></Defs>
        <Rect width={distance} height={height} fill='url(#right)' y={-sumDps(topRight, bottomRight)}/>
      </Svg>
      }
      {activeSides.bottom && <Svg
        width={widthWithAdditional} height={distanceWithAdditional}
        style={{ position: 'absolute', top: height, left: bottomLeft, ...(isRTL && { transform: [{ scaleX: -1 }] }) }}
      >
        <Defs><LinearGradient id='bottom' x1='0' y1='0' x2='0' y2='1'>{linearGradient}</LinearGradient></Defs>
        <Rect width={width} height={distance} fill='url(#bottom)' x={-sumDps(bottomLeft, bottomRight)}/>
      </Svg>
      }
      {activeSides.top && <Svg
        width={widthWithAdditional} height={distanceWithAdditional}
        style={{ position: 'absolute', top: -distance, left: topLeft, ...(isRTL && { transform: [{ scaleX: -1 }] }) }}
      >
        <Defs><LinearGradient id='top' x1='0' y1='1' x2='0' y2='0'>{linearGradient}</LinearGradient></Defs>
        <Rect width={width} height={distance} fill='url(#top)' x={-sumDps(topLeft, topRight)}/>
      </Svg>
      }


      {/* Corners */}

      {/* The anchor for the svgs path is the top left point in the corner square.
        The starting point is the clockwise external arc init point. */}

      {activeCorners.topLeft && <Svg width={topLeftShadow + additional} height={topLeftShadow + additional}
        style={{ position: 'absolute', top: -distance, left: -distance, ...(isRTL && { transform: [{ scaleX: -1 }] }) }}
      >
        <Defs>{radialGradient('topLeft', true, true, topLeft, topLeftShadow)}</Defs>
        <Path fill='url(#topLeft)' d={`M0,${topLeftShadow} a${topLeftShadow},${topLeftShadow} 0 0 1 ${topLeftShadow} ${-topLeftShadow} v${distance} ${paintInside
          ? `v${topLeft} h${-topLeft}` // read [*2] below for the explanation for this
          : `a${topLeft},${topLeft} 0 0 0 ${-topLeft},${topLeft}`
        } h${-distance} Z`}/>
      </Svg>}

      {activeCorners.topRight && <Svg width={topRightShadow + additional} height={topRightShadow + additional}
        style={{
          position: 'absolute', top: -distance, left: width,
          transform: [{ translateX: isRTL ? bottomRight : -bottomRight }, ...(isRTL ? [{ scaleX: -1 }] : [])],
        }}
      >
        <Defs>{radialGradient('topRight', true, false, topRight, topRightShadow)}</Defs>
        <Path fill='url(#topRight)' d={`M0,0 a${topRightShadow},${topRightShadow} 0 0 1 ${topRightShadow},${topRightShadow} h${-distance} ${paintInside
          ? `h${-topRight} v${-topLeft}`
          : `a${topRight},${topRight} 0 0 0 ${-topRight},${-topRight}`
        } v${-distance} Z`}/>
        {/*  */}
      </Svg>}

      {activeCorners.bottomLeft && <Svg width={bottomLeftShadow + additional} height={bottomLeftShadow + additional}
        style={{ position: 'absolute', top: height, left: -distance, transform: [{ translateY: -bottomLeft }, ...(isRTL ? [{ scaleX: -1 }] : [])] }}
      >
        <Defs>{radialGradient('bottomLeft', false, true, bottomLeft, bottomLeftShadow)}</Defs>
        <Path fill='url(#bottomLeft)' d={`M${bottomLeftShadow},${bottomLeftShadow} a${bottomLeftShadow},${bottomLeftShadow} 0 0 1 ${-bottomLeftShadow},${-bottomLeftShadow} h${distance} ${paintInside
          ? `h${bottomLeft} v${bottomLeft}`
          : `a${bottomLeft},${bottomLeft} 0 0 0 ${bottomLeft},${bottomLeft}`
        } v${distance} Z`}/>
      </Svg>}

      {activeCorners.bottomRight && <Svg width={bottomRightShadow + additional} height={bottomRightShadow + additional}
        style={{
          position: 'absolute', top: height, left: width,
          transform: [{ translateX: isRTL ? bottomRight : -bottomRight }, { translateY: -bottomRight }, ...(isRTL ? [{ scaleX: -1 }] : [])],
        }}
      >
        <Defs>{radialGradient('bottomRight', false, false, bottomRight, bottomRightShadow)}</Defs>
        <Path fill='url(#bottomRight)' d={`M${bottomRightShadow},0 a${bottomRightShadow},${bottomRightShadow} 0 0 1 ${-bottomRightShadow},${bottomRightShadow} v${-distance} ${paintInside
          ? `v${-bottomRight} h${bottomRight}`
          : `a${bottomRight},${bottomRight} 0 0 0 ${bottomRight},${-bottomRight}`
        } h${distance} Z`}/>
      </Svg>}


      {/* Paint the inner area, so we can offset it.
        [*2]: I tried redrawing the inner corner arc, but there would always be a small gap between the external shadows
        and this internal shadow along the curve. So, instead we dont specify the inner arc on the corners when
        paintBelow, but just use a square inner corner. And here we will just mask those squares in each corner. */}
      {paintInside && <Svg width={widthWithAdditional} height={heightWithAdditional}
        style={{ position: 'absolute', ...(isRTL && { transform: [{ scaleX: -1 }] }) }}
      >
        <Defs>
          <Mask id='maskPaintBelow'>
            {/* Paint all white, then black on border external areas to erase them */}
            <Rect width={width} height={height} fill='#fff'/>
            {/* Remove the corners, as squares. Could use <Path/>, but this way seems to be more maintainable. */}
            <Rect width={topLeft} height={topLeft} fill='#000'/>
            <Rect width={topRight} height={topRight} x={width} transform={`translate(${-topRight}, 0)`} fill='#000'/>
            <Rect width={bottomLeft} height={bottomLeft} y={height} transform={`translate(0, ${-bottomLeft})`} fill='#000'/>
            <Rect width={bottomRight} height={bottomRight} x={width} y={height} transform={`translate(${-bottomRight}, ${-bottomRight})`} fill='#000'/>
          </Mask>
        </Defs>
        <Rect width={width} height={height} mask='url(#maskPaintBelow)' fill={startColorWoOpacity} fillOpacity={startColorOpacity}/>
      </Svg>
      }

    </>);
  }, [
    safeRender, width, height, startColorProp, finalColorProp, radii, distance, distanceWithAdditional, heightWithAdditional,
    widthWithAdditional, paintInside, sidesProp, cornersProp, isRTL,
  ]);

  const result = useMemo(() => {
    return (
      // pointerEvents: https://github.com/SrBrahma/react-native-shadow-2/issues/24
      <View style={[containerViewStyle]} pointerEvents='box-none'>
        <View style={[{ ...StyleSheet.absoluteFillObject, left: offsetX, top: offsetY }, shadowViewStyle]}>
          {shadow}
        </View>
        <View
          pointerEvents="box-none"
          style={[
            // Without alignSelf: 'flex-start', if your Shadow component had a sibling under the same View, the shadow would try to have the same size of the sibling,
            // being it for example a text below the shadowed component. https://imgur.com/a/V6ZV0lI, https://github.com/SrBrahma/react-native-shadow-2/issues/7#issuecomment-899764882
            { alignSelf: 'flex-start' },
            sizeProp && {
              width, height,
              borderTopLeftRadius: radii.topLeft, // can't remember why we are passing the radii here.
              borderTopRightRadius: radii.topRight,
              borderBottomLeftRadius: radii.bottomLeft,
              borderBottomRightRadius: radii.bottomRight,
            }, viewStyle,
          ]}

          onLayout={(e) => {
            if (sizeProp) // For some really strange reason, attaching conditionally the onLayout wasn't working
              return; // on condition change, so we check here inside if the sizeProp is defined.
              // [web] [*3]: the width/height we get here is already rounded by RN, even if the real size according to the browser
              // inspector is decimal. It will round up if (>= .5), else, down.
            const layout = e.nativeEvent.layout;
            setChildWidth(layout.width); // In web to round decimal values to integers. In mobile it's already rounded.
            setChildHeight(layout.height);
          }}
        >
          {children}
        </View>
      </View>
    );
  }, [containerViewStyle, offsetX, offsetY, shadowViewStyle, shadow, sizeProp, width, height, radii.topLeft, radii.topRight, radii.bottomLeft, radii.bottomRight, viewStyle, children]);

  return result;
};
