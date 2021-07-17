import React, { useMemo, useState } from 'react';
import { Platform, StyleProp, View, ViewStyle, PixelRatio } from 'react-native';
import { Svg, Defs, LinearGradient, Rect, Stop, Path, RadialGradient, Mask } from 'react-native-svg';
import { parseToRgb, rgbToColorString } from 'polished'; // To extract alpha
import type { RgbaColor } from 'polished/lib/types/color';


type Side = 'left' | 'right' | 'top' | 'bottom';
type Corner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
type CornerRadius = Record<Corner, number>;
// Add Shadow to the corner names
type CornerRadiusShadow = Record<`${Corner}Shadow`, number>;


const OS = Platform.OS;

/** Rounds the given size to a pixel perfect size. */
export function R(value: number): number {
  // In Web, 1dp=1px. But it accepts decimal sizes, and it's somewhat problematic.
  // The size rounding is browser-dependent, so we do the decimal rounding for web by ourselves to have a
  // consistent behavior. We floor it, because it's better for the child to overlap by a pixel the right/bottom shadow part
  // than to have a pixel wide gap between them.
  // **Only if we receive a decimal value here!!!**. Read [*3]!! Else, the gap may still happen as we don't have control over it.
  if (OS === 'web')
    return Math.floor(value);

  return PixelRatio.roundToNearestPixel(value);
}
/** Converts dp to pixels. */
function P(value: number) {
  return PixelRatio.getPixelSizeForLayoutSize(value);
}
/** How many pixels for each dp. scale = pixels/dp */
const scale = PixelRatio.get();

/** Converts two sizes to pixel for perfect math, sum them and converts the result back to dp. */
function sumDps(a: number, b: number) {
  return R((P(a) + P(b)) / scale);
}

/** [Android/ios?] [*4] A small safe margin for the svg sizes.
 *
 * It fixes some gaps that we had, as even that the svg size and the svg rect for example size were the same, this rect
 * would still strangely be cropped/clipped. We give this additional size to the svg so our rect/etc won't be unintendedly clipped.
 *
 * It doesn't mean 1 pixel, as RN uses dp sizing, it's just an arbitrary and big enough number. */
const additional = 1;


export interface ShadowI {
  /** The color of the shadow when it's right next to the given content, leaving it.
   * Accepts alpha channel.
   *
   * @default '#00000020' */
  startColor?: string;
  /** The color of the shadow at the maximum distance from the content. Accepts alpha channel.
   * @default '#0000', transparent. */
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
   * Fallbacks to 0. */
  radius?: number | {default?: number, topLeft?: number, topRight?: number, bottomLeft?: number, bottomRight?: number};
  /** If it should try to get the radius from the child view **`style`** if `radius` property is undefined. It will get the values for each
   * corner, like `borderTopLeftRadius`, and also `borderRadius`. If a specific corner isn't defined, `borderRadius` value is used.
   * @default true */
  getChildRadiusStyle?: boolean;
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
   * Read `paintInside` property description for related configuration.
   * @default [0, 0] */
  offset?: [x: number | string, y: number | string];
  /** If the shadow should be applied inside the external shadows, below the child. `startColor` is used as fill color.
   *
   * You may want this as true when using offset or if your child have some transparency.
   * @default false */
  paintInside?: boolean;
  /** The style of the view that wraps your child component.
   *
   * If using the `size` property, this wrapping view will automatically receive as style the `size` values and the
   * radiuses from the `radius` property or from the child, if `getChildRadiusStyle`. You may overwrite those defaults
   * by undefine'ing the changed styles in this property. */
  viewStyle?: ViewStyle;
  /** The style of the view that contains the shadow and your child component. */
  containerViewStyle?: StyleProp<ViewStyle>;
  /** If it should try to get the `width` and `height` from the child **style** if `size` prop is undefined.
   *
   * If the size style is found, it won't use the onLayout strategy to get the child style after its render.
   * @default true */
  // getChildSizeStyle?: boolean;
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
}

export const Shadow: React.FC<ShadowI> = ({
  radius: radiusProp,
  sides: sidesProp = ['left', 'right', 'top', 'bottom'],
  corners: cornersProp = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'],
  containerViewStyle,
  startColor: startColorProp = '#00000020',
  finalColor: finalColorProp = '#0000',
  distance: distanceProp = 10,
  children,
  size: sizeProp, // Do not default here. We do `if (sizeProp)` on onLayout.
  offset = [0, 0],
  getChildRadiusStyle: getChildRadiusProp = true,
  paintInside = false,
  viewStyle,
}) => {
  const [widthProp, heightProp] = sizeProp ? [R(sizeProp[0]), R(sizeProp[1])] : [];
  const [childWidth, setChildWidth] = useState<number | undefined>();
  const [childHeight, setChildHeight] = useState<number | undefined>();

  const [offsetX, offsetY] = offset;
  const distance = R(Math.max(distanceProp, 0)); // Min val as 0
  /** Read {@link additional}, [*4] */
  const distanceWithAdditional = distance + additional;
  const width = widthProp ?? childWidth ?? '100%'; // '100%' sometimes will lead to gaps. child size don't lie.
  const height = heightProp ?? childHeight ?? '100%';
  /** Will (+ additional), only if its value isn't '100%'. */
  const widthWithAdditional = typeof width === 'string' ? width : width + 1;
  /** Will (+ additional), only if its value isn't '100%'. */
  const heightWithAdditional = typeof height === 'string' ? height : height + 1;

  const doGetChildRadius = getChildRadiusProp && (radiusProp === undefined);

  const childStyle: ViewStyle | undefined = useMemo(() => {
    if (doGetChildRadius && React.Children.count(children) > 1)
      throw new Error('Only single child is accepted in Shadow component with getChildRadius={true} (default). You should wrap it in a View or change this property to false and manually enter the borderRadius in the radius property.');
    const childStyleTemp = doGetChildRadius
      ? (React.Children.only(children) as any | undefined)?.props?.style as ViewStyle | undefined
      : undefined;
      // Convert array style to a single obj style.
    return (Array.isArray(childStyleTemp)
      ? childStyleTemp.reduce((obj, v) => {
        if (v && typeof v === 'object')
          return { ...obj, ...v };
      }, {})
      : childStyleTemp);

  }, [children, doGetChildRadius]);

  const radiuses = useMemo(() => {
    /** Not yet treated. May be negative / undefined */
    const cornerRadiusPartial: Partial<CornerRadius> = doGetChildRadius
      ? {
        topLeft: childStyle?.borderTopLeftRadius ?? childStyle?.borderRadius,
        topRight: childStyle?.borderTopRightRadius ?? childStyle?.borderRadius,
        bottomLeft: childStyle?.borderBottomLeftRadius ?? childStyle?.borderRadius,
        bottomRight: childStyle?.borderBottomRightRadius ?? childStyle?.borderRadius,
      } : (typeof radiusProp === 'number' ? {
        topLeft: radiusProp,
        topRight: radiusProp,
        bottomLeft: radiusProp,
        bottomRight: radiusProp,
      } : {
        topLeft: radiusProp?.topLeft ?? radiusProp?.default,
        topRight: radiusProp?.topRight ?? radiusProp?.default,
        bottomLeft: radiusProp?.bottomLeft ?? radiusProp?.default,
        bottomRight: radiusProp?.bottomRight ?? radiusProp?.default,
      });
    const result = {
      bottomLeft: R(Math.max(cornerRadiusPartial.bottomLeft ?? 0, 0)),
      bottomRight: R(Math.max(cornerRadiusPartial.bottomRight ?? 0, 0)),
      topLeft: R(Math.max(cornerRadiusPartial.topLeft ?? 0, 0)),
      topRight: R(Math.max(cornerRadiusPartial.topRight ?? 0, 0)),
    };
    return result;
  }, [childStyle, doGetChildRadius, radiusProp]);

  const shadow = useMemo(() => {

    // polished vs 'transparent': https://github.com/styled-components/polished/issues/566. Maybe tinycolor2 would allow it.
    const startColor = startColorProp === 'transparent' ? '#0000' : startColorProp;
    const finalColor = finalColorProp === 'transparent' ? '#0000' : finalColorProp;

    const startColorRgb = parseToRgb(startColor) as Omit<RgbaColor, 'alpha'> & {alpha?: number};
    const finalColorRgb = parseToRgb(finalColor) as Omit<RgbaColor, 'alpha'> & {alpha?: number};

    // [*1]: Seems that SVG in web accepts opacity in hex color, but in mobile doesn't.
    // So we remove the opacity from the color, and only apply the opacity in stopOpacity, so in web
    // it isn't applied twice.
    const startColorWoOpacity = rgbToColorString({ ...startColorRgb, alpha: undefined }); // overwrite alpha
    const finalColorWoOpacity = rgbToColorString({ ...finalColorRgb, alpha: undefined });

    const startColorOpacity = startColorRgb.alpha ?? 1;
    const finalColorOpacity = finalColorRgb.alpha ?? 1;

    const { topLeft, topRight, bottomLeft, bottomRight } = radiuses;

    const cornerShadowRadius: CornerRadiusShadow = {
      topLeftShadow: sumDps(topLeft, distance),
      topRightShadow: sumDps(topRight, distance),
      bottomLeftShadow: sumDps(bottomLeft, distance),
      bottomRightShadow: sumDps(bottomRight, distance),
    };


    const { topLeftShadow, topRightShadow, bottomLeftShadow, bottomRightShadow } = cornerShadowRadius;

    /** Which sides will have shadow. */
    const activeSides: Record<Side, boolean> = {
      left: sidesProp.includes('left'),
      right: sidesProp.includes('right'),
      top: sidesProp.includes('top'),
      bottom: sidesProp.includes('bottom'),
    };

    /** Which corners will have shadow. */
    const activeCorners: Record<Corner, boolean> = {
      topLeft: cornersProp.includes('topLeft'),
      topRight: cornersProp.includes('topRight'),
      bottomLeft: cornersProp.includes('bottomLeft'),
      bottomRight: cornersProp.includes('bottomRight'),
    };

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
        <Stop offset={1} stopColor={finalColorWoOpacity} stopOpacity={finalColorOpacity} />
      </RadialGradient>);
    }


    return (<>
      {/* Sides */}

      {/* shape-rendering fixes some gaps on web. Not available on Android/iOS, but won't affect them.
          We use shapeRendering, but React converts it to shape-rendering. Else, it would work but throw some console errors.
          It don't actually exists in react-native-svg, but the prop is passed anyway. Else, there probably wouldn't be a solution for web for the gaps!
          We do the {...{shape[...]}} else TS would complain that this prop isn't accepted. */}
      {activeSides.left &&
        <Svg
          width={distanceWithAdditional} height={heightWithAdditional} {...{ shapeRendering: 'crispEdges' }}
          style={{ position: 'absolute', left: -distance, top: topLeft }}
        >
          <Defs><LinearGradient id='left' x1='1' y1='0' x2='0' y2='0'>{linearGradient}</LinearGradient></Defs>
          {/* I was using a Mask here to remove part of each side (same size as now, sum of related corners), but,
          just moving the rectangle outside its viewbox is already a mask!! -> svg overflow is cutten away. <- */}
          <Rect width={distance} height={height} fill='url(#left)' y={-sumDps(topLeft, bottomLeft)}/>
        </Svg>
      }
      {activeSides.right &&
        <Svg
          width={distanceWithAdditional} height={heightWithAdditional} {...{ shapeRendering: 'crispEdges' }}
          style={{ position: 'absolute', left: width, top: topRight }}
        >
          <Defs><LinearGradient id='right' x1='0' y1='0' x2='1' y2='0'>{linearGradient}</LinearGradient></Defs>
          <Rect width={distance} height={height} fill='url(#right)' y={-sumDps(topRight, bottomRight)}/>
        </Svg>
      }
      {activeSides.bottom &&
        <Svg
          width={widthWithAdditional} height={distanceWithAdditional} {...{ shapeRendering: 'crispEdges' }}
          style={{ position: 'absolute', top: height, left: bottomLeft }}
        >
          <Defs><LinearGradient id='bottom' x1='0' y1='0' x2='0' y2='1'>{linearGradient}</LinearGradient></Defs>
          <Rect width={width} height={distance} fill='url(#bottom)' x={-sumDps(bottomLeft, bottomRight)}/>
        </Svg>
      }
      {activeSides.top &&
        <Svg
          width={widthWithAdditional} height={distanceWithAdditional} {...{ shapeRendering: 'crispEdges' }}
          style={{ position: 'absolute', top: -distance, left: topLeft }}
        >
          <Defs><LinearGradient id='top' x1='0' y1='1' x2='0' y2='0'>{linearGradient}</LinearGradient></Defs>
          <Rect width={width} height={distance} fill='url(#top)' x={-sumDps(topLeft, topRight)}/>
        </Svg>
      }


      {/* Corners */}

      {/* The anchor for the svgs is the top left point in the corner square.
        The starting point is the clockwise external arc init point. */}

      {activeCorners.topLeft &&
        <Svg width={topLeftShadow + additional} height={topLeftShadow + additional}
          style={{ position: 'absolute', top: -distance, left: -distance }}
        >
          <Defs>{radialGradient('topLeft', true, true, topLeft, topLeftShadow)}</Defs>
          <Path fill='url(#topLeft)' d={`M0,${topLeftShadow} a${topLeftShadow},${topLeftShadow} 0 0 1 ${topLeftShadow} ${-topLeftShadow} v${distance} ${paintInside
            ? `v${topLeft} h${-topLeft}` // read [*2] below for the explanation for this
            : `a${topLeft},${topLeft} 0 0 0 ${-topLeft},${topLeft}`
          } h${-distance} Z`}/>
        </Svg>
      }
      {activeCorners.topRight &&
        <Svg width={topRightShadow + additional} height={topRightShadow + additional}
          style={{ position: 'absolute', top: -distance, left: width, transform: [{ translateX: -topRight }]  }}
        >
          <Defs>{radialGradient('topRight', true, false, topRight, topRightShadow)}</Defs>
          <Path fill='url(#topRight)' d={`M0,0 a${topRightShadow},${topRightShadow} 0 0 1 ${topRightShadow},${topRightShadow} h${-distance} ${paintInside
            ? `h${-topRight} v${-topLeft}`
            : `a${topRight},${topRight} 0 0 0 ${-topRight},${-topRight}`
          } v${-distance} Z`}/>
          {/*  */}
        </Svg>
      }
      {activeCorners.bottomLeft &&
        <Svg width={bottomLeftShadow + additional} height={bottomLeftShadow + additional}
          style={{ position: 'absolute', top: height, left: -distance, transform: [{ translateY: -bottomLeft }]  }}
        >
          <Defs>{radialGradient('bottomLeft', false, true, bottomLeft, bottomLeftShadow)}</Defs>
          <Path fill='url(#bottomLeft)' d={`M${bottomLeftShadow},${bottomLeftShadow} a${bottomLeftShadow},${bottomLeftShadow} 0 0 1 ${-bottomLeftShadow},${-bottomLeftShadow} h${distance} ${paintInside
            ? `h${bottomLeft} v${bottomLeft}`
            : `a${bottomLeft},${bottomLeft} 0 0 0 ${bottomLeft},${bottomLeft}`
          } v${distance} Z`}/>
        </Svg>
      }
      {activeCorners.bottomRight &&
        <Svg width={bottomRightShadow + additional} height={bottomRightShadow + additional}
          style={{ position: 'absolute', top: height, left: width,
            transform: [{ translateX: -bottomRight }, { translateY: -bottomRight }]  }}
        >
          <Defs>{radialGradient('bottomRight', false, false, bottomRight, bottomRightShadow)}</Defs>
          <Path fill='url(#bottomRight)' d={`M${bottomRightShadow},0 a${bottomRightShadow},${bottomRightShadow} 0 0 1 ${-bottomRightShadow},${bottomRightShadow} v${-distance} ${paintInside
            ? `v${-bottomRight} h${bottomRight}`
            : `a${bottomRight},${bottomRight} 0 0 0 ${bottomRight},${-bottomRight}`
          } h${distance} Z`}/>
        </Svg>
      }


      {/* Paint the inner area, so we can offset it.
        [*2]: I tried redrawing the inner corner arc, but there would always be a small gap between the external shadows
        and this internal shadow along the curve. So, instead we dont specify the inner arc on the corners when
        paintBelow, but just use a square inner corner. And here we will just mask those squares in each corner. */}
      {paintInside && <Svg style={{ position: 'absolute' }}
        width={widthWithAdditional} height={heightWithAdditional} {...{ shapeRendering: 'crispEdges' }}
      >
        <Defs>
          <Mask id='maskPaintBelow'>
            {/* Paint all white, then black on border external areas to erase them */}
            <Rect width={width} height={height} fill='#fff'/>
            {/* Remove the corners, as squares. Could use <Path/>, but this way seems to be more maintainable. */}
            <Rect width={topLeft} height={topLeft} fill='#000'/>
            <Rect width={topRight} height={topRight} x={width} transform={`translate(${-topRight}, 0)`} fill='#000'/>
            <Rect width={bottomLeft} height={bottomLeft} y={height} transform={`translate(0, ${-bottomLeft})`} fill='#000'/>
            <Rect width={bottomRight} height={bottomRight} x={width} y={height} transform={`translate(${-bottomRight}, ${-bottomRight})`}fill='#000'/>
          </Mask>
        </Defs>
        <Rect width={width} height={height} mask='url(#maskPaintBelow)' fill={startColorWoOpacity} fillOpacity={startColorOpacity}/>
      </Svg>
      }

    </>);
  }, [height, width, startColorProp, finalColorProp, radiuses, distance, sidesProp, cornersProp,
    distanceWithAdditional, heightWithAdditional,  widthWithAdditional, paintInside]);

  const result = useMemo(() => {
    return (<View style={containerViewStyle}>
      {/* TODO any benefit in using width/height instead of '100%' here? */}
      <View style={{ width: '100%', height: '100%', position: 'absolute', left: offsetX, top: offsetY }}>
        {shadow}
      </View>
      <View
        // Without alignSelf, if your Shadow component had a sibling under the same View, the shadow wouldn't grow shorter
        // than this sibling, being it for example a text below the shadowed component. https://imgur.com/a/V6ZV0lI
        style={[{ alignSelf: 'flex-start' }, sizeProp && {
          width, height,
          borderTopLeftRadius: radiuses.topLeft,
          borderTopRightRadius: radiuses.topRight,
          borderBottomLeftRadius: radiuses.bottomLeft,
          borderBottomRightRadius: radiuses.bottomRight,
        }, viewStyle]}
        {...!sizeProp && { // Only use onLayout if sizeProp wasn't received.
          onLayout: (e) => {
          // [web] [*3]: the width/height we get here is already rounded, even if the real size according to the browser
          // inspector is decimal. If a way to get the exact size is found, we could use Math.floor() on it to avoid
          // the pixel gap between the child and the shadow.
            const layout = e.nativeEvent.layout;
            setChildWidth(layout.width);
            setChildHeight(layout.height);
          },
        }}
      >
        {children}
      </View>
    </View>);
  }, [shadow, children, width, height, sizeProp, radiuses, viewStyle, containerViewStyle, offsetX, offsetY]);

  return result;
};