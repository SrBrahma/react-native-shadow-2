import { Children, useMemo, useState } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import { I18nManager, StyleSheet, View } from 'react-native';
import { Defs, LinearGradient, Mask, Path, Rect, Stop, Svg } from 'react-native-svg';
import { colord } from 'colord';
import type { Corner, CornerRadius, CornerRadiusShadow, RadialGradientPropsOmited, Side } from './utils';
import {
  additional, cornersArray, cornerToStyle, objFromKeys,
  R, radialGradient, sidesArray, sumDps,
} from './utils';



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
   * If undefined, it will attempt to get the child radius from the borderRadius related styles.
   *
   * Each corner fallbacks to 0. */
  radius?: number | { default?: number; topLeft?: number; topRight?: number; bottomLeft?: number; bottomRight?: number};
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
  style?: StyleProp<ViewStyle>;
  /** The style of the view that contains the shadow and your child component. */
  containerStyle?: StyleProp<ViewStyle>;
  /** Props for the Shadow view. You shouldn't need to use this. You may pass style to this. */
  shadowViewProps?: ViewProps;
  /** If it should try to get the `width` and `height` from the child **style** if `size` prop is undefined.
   *
   * If the size style is found, it won't use the onLayout strategy to get the child style after its render.
   * @default true */
  /** If you don't want the 2 renders of the shadow (first applies the relative positioning and sizing that may contain a quick pixel gap, second uses exact pixel size from onLayout) or you are having noticeable gaps/overlaps on the first render,
   * you can use this property. Using this won't trigger the onLayout, so only 1 render is made.
   *
   * It will apply the corresponding `width` and `height` styles to the `style` property.
   *
   * You may want to set `backgroundColor` in the `style` property for your child background color.
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
  /** Use this when you want your children to ocuppy all available horizontal space.
   *
   * Shortcut to `style={{alignSelf: 'stretch'}}.
   *
   * [Explanation](https://github.com/SrBrahma/react-native-shadow-2/issues/7#issuecomment-899784537)
   *
   * @default false */
  stretch?: boolean;
}


// To help memoization.
const defaultSides: Exclude<ShadowProps['sides'], undefined> = ['left', 'right', 'top', 'bottom'];
const defaultCorners: Exclude<ShadowProps['corners'], undefined> = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];
const emptyObj = {};

export const Shadow: React.FC<ShadowProps> = (props) => {
  const isRTL = I18nManager.isRTL;
  const [childLayoutWidth, setChildLayoutWidth] = useState<number | undefined>();
  const [childLayoutHeight, setChildLayoutHeight] = useState<number | undefined>();

  const {
    sides: sidesProp = defaultSides,
    corners: cornersProp = defaultCorners,
    startColor: startColorProp = '#00000020',
    finalColor: finalColorProp = colord(startColorProp).alpha(0).toHex(),
    distance: distanceProp = 10,
    size: sizeProp, // Do not default here. We do `if (sizeProp)` on onLayout.
    style,
    safeRender = false,
    stretch = false,
    /** Defaults to true if offset is defined, else defaults to false */
    paintInside = props.offset ? true : false,
    children,
    radius,
    containerStyle,
    offset,
    shadowViewProps,
  } = props;


  /** `s` is a shortcut for `style` I am using in another lib of mine (react-native-gev). While currently no one uses it besides me,
   * I believe it can come to be a popular pattern. */
  const childProps: {style?: ViewStyle; s?: ViewStyle} = (Children.count(children) === 1) ? (Children.only(children) as JSX.Element).props ?? emptyObj : emptyObj;

  const cStyle = useMemo(() => {
    return StyleSheet.flatten([childProps.style, childProps.s]);
  }, [childProps.s, childProps.style]);

  const { cTopLeft, cTopRight, cBottomLeft, cBottomRight } = useMemo(() => {
    return {
      cTopLeft: cStyle.borderTopLeftRadius ?? cStyle.borderTopStartRadius ?? cStyle.borderRadius,
      cTopRight: cStyle.borderTopRightRadius ?? cStyle.borderTopEndRadius ?? cStyle.borderRadius,
      cBottomLeft: cStyle.borderBottomLeftRadius ?? cStyle.borderBottomStartRadius ?? cStyle.borderRadius,
      cBottomRight: cStyle.borderBottomRightRadius ?? cStyle.borderBottomEndRadius ?? cStyle.borderRadius,
    };
  }, [cStyle.borderTopLeftRadius, cStyle.borderTopStartRadius, cStyle.borderRadius, cStyle.borderTopRightRadius, cStyle.borderTopEndRadius, cStyle.borderBottomLeftRadius, cStyle.borderBottomStartRadius, cStyle.borderBottomRightRadius, cStyle.borderBottomEndRadius]);

  const width = (sizeProp ? R(sizeProp[0]) : childLayoutWidth) ?? '100%'; // '100%' sometimes will lead to gaps. Child's size don't lie.
  const height = (sizeProp ? R(sizeProp[1]) : childLayoutHeight) ?? '100%';

  const { topLeft, topRight, bottomLeft, bottomRight }: CornerRadius = useMemo(() => getRadii({ width, height, cTopLeft, cTopRight, cBottomLeft, cBottomRight, radius, style }),
    [width, height, radius, cTopLeft, cTopRight, cBottomLeft, cBottomRight, style],
  );

  const shadow = useMemo(() => getShadow({
    safeRender, topLeft, topRight, bottomLeft, bottomRight, width, height, isRTL, distanceProp, startColorProp, finalColorProp, sidesProp, cornersProp, paintInside,
    shadowViewProps, offset,
  }), [
    width, height, topLeft, topRight, bottomLeft, bottomRight, offset,
    distanceProp, startColorProp, finalColorProp, sidesProp, cornersProp,
    paintInside, shadowViewProps, safeRender, isRTL,
  ]);

  const result = useMemo(() => getResult({
    shadow, stretch, topLeft, topRight, bottomLeft, bottomRight, width, height, setChildLayoutWidth, setChildLayoutHeight, children, containerStyle, sizeProp, style,
  }), [children, shadow, style, stretch, topLeft, topRight, bottomLeft, bottomRight, width, height, containerStyle, sizeProp]);

  return result;
};



function getResult({
  shadow, stretch, width, height, setChildLayoutWidth, setChildLayoutHeight,
  containerStyle, children, sizeProp, style,
  topLeft, topRight, bottomLeft, bottomRight,
}: {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
  containerStyle: ShadowProps['containerStyle'];
  shadow: JSX.Element | null;
  children: any;
  sizeProp: ShadowProps['size'];
  style: ShadowProps['style'];
  stretch: boolean;
  width: string | number;
  height: string | number;
  setChildLayoutWidth: React.Dispatch<React.SetStateAction<number | undefined>>;
  setChildLayoutHeight: React.Dispatch<React.SetStateAction<number | undefined>>;
}): JSX.Element {
  return (
    // pointerEvents: https://github.com/SrBrahma/react-native-shadow-2/issues/24
    <View style={containerStyle} pointerEvents='box-none'>
      {shadow}
      <View
        pointerEvents='box-none'
        style={[
          {
          // Without alignSelf: 'flex-start', if your Shadow component had a sibling under the same View, the shadow would try to have the same size of the sibling,
          // being it for example a text below the shadowed component. https://imgur.com/a/V6ZV0lI, https://github.com/SrBrahma/react-native-shadow-2/issues/7#issuecomment-899764882
            alignSelf: stretch ? 'stretch' : 'flex-start',
            // We are defining here the radii so when using radius props it also affects the backgroundColor and Pressable ripples are properly contained.
            borderTopLeftRadius: topLeft,
            borderTopRightRadius: topRight,
            borderBottomLeftRadius: bottomLeft,
            borderBottomRightRadius: bottomRight,
          },
          sizeProp && { width, height },
          style,
        ]}
        onLayout={(e) => {
          if (sizeProp) // For some really strange reason, attaching conditionally the onLayout wasn't working
            return; // on condition change, so we check here inside if the sizeProp is defined.
          // [web] [*3]: the width/height we get here is already rounded by RN, even if the real size according to the browser
          // inspector is decimal. It will round up if (>= .5), else, down.
          const layout = e.nativeEvent.layout;
          setChildLayoutWidth(layout.width); // In web to round decimal values to integers. In mobile it's already rounded.
          setChildLayoutHeight(layout.height);
        }}
      >
        {children}
      </View>
    </View>
  );
}

/** We make some effort for this to be likely memoized */
function getRadii({
  width, height, radius, style, cTopLeft, cTopRight, cBottomLeft, cBottomRight,
}: {
  width: string | number;
  height: string | number;
  radius: ShadowProps['radius'];
  style: StyleProp<ViewStyle>;
  cTopLeft: number | undefined;
  cTopRight: number | undefined;
  cBottomLeft: number | undefined;
  cBottomRight: number | undefined;
}): CornerRadius {


  const child = {
    topLeft: cTopLeft,
    topRight: cTopRight,
    bottomLeft: cBottomLeft,
    bottomRight: cBottomRight,
  };

  /** Not yet treated. May be negative / undefined */
  const cornerRadiusPartial: Partial<CornerRadius> = (() => {
    if (radius !== undefined)
      return objFromKeys(cornersArray, typeof radius === 'number'
        ? () => radius
        : (k) => radius[k] ?? radius.default);

    const mergedStyleProp = StyleSheet.flatten(style ?? {}); // Convert possible array style to a single obj style.

    const cornersRadii = objFromKeys(cornersArray, (k) =>
      // For each corner, first ~borderTopLeftRadius, then ~borderTopStartRadius, then borderRadius.
      // Try to get `style` radii.
      mergedStyleProp[cornerToStyle[k][0]] ?? mergedStyleProp[cornerToStyle[k][1]] ?? mergedStyleProp.borderRadius
        // If corner not found on `style`, try to get on child's `style`.
        ?? child[k],
    );

    return cornersRadii;
  })();


  /** Round and zero negative radius values */
  const radiiSanitized = objFromKeys(cornersArray, (k) => R(Math.max(cornerRadiusPartial[k] ?? 0, 0)));

  let result = radiiSanitized;

  if (typeof width === 'number' && typeof height === 'number') {
    // https://css-tricks.com/what-happens-when-border-radii-overlap/
    // Note that the tutorial above doesn't mention the specification of minRatio < 1 but it's required as said on spec and will malfunction without it.
    const minRatio = Math.min(
      width / (radiiSanitized.topLeft + radiiSanitized.topRight),
      height / (radiiSanitized.topRight + radiiSanitized.bottomRight),
      width / (radiiSanitized.bottomLeft + radiiSanitized.bottomRight),
      height / (radiiSanitized.topLeft + radiiSanitized.bottomLeft),
    );
    if (minRatio < 1)
      result = objFromKeys(cornersArray, (k) => R(radiiSanitized[k] * minRatio));
  }

  return result;
}



function getShadow({
  safeRender, width, height, isRTL, distanceProp, startColorProp, finalColorProp,
  topLeft, topRight, bottomLeft, bottomRight,
  sidesProp, cornersProp, paintInside, offset, shadowViewProps,
}: {
  safeRender: boolean;
  width: string | number;
  height: string | number;
  isRTL: boolean;
  distanceProp: number;
  startColorProp: string;
  finalColorProp: string;
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
  sidesProp: ('top' | 'left' | 'right' | 'bottom')[];
  cornersProp: ('topRight' | 'topLeft' | 'bottomLeft' | 'bottomRight')[];
  paintInside: boolean;
  offset: ShadowProps['offset'];
  shadowViewProps: ShadowProps['shadowViewProps'];
}): JSX.Element | null {
  // Skip if using safeRender and we still don't have the exact sizes, if we are still on the first render using the relative sizes.
  if (safeRender && (typeof width === 'string' || typeof height === 'string'))
    return null;

  /** To be used inside Svg style */
  const rtlStyle = isRTL && { transform: [{ scaleX: -1 }] };
  /** To be used inside Svg style.transform */
  const rtlTransform = isRTL ? [{ scaleX: -1 }] : [];

  const distance = R(Math.max(distanceProp, 0)); // Min val as 0
  const distanceWithAdditional = distance + additional;

  /** Will (+ additional), only if its value isn't '100%'. [*4] */
  const widthWithAdditional = typeof width === 'string' ? width : width + additional;
  /** Will (+ additional), only if its value isn't '100%'. [*4] */
  const heightWithAdditional = typeof height === 'string' ? height : height + additional;

  const startColord = colord(startColorProp);
  const finalColord = colord(finalColorProp);

  // [*1]: Seems that SVG in web accepts opacity in hex color, but in mobile gradient doesn't.
  // So we remove the opacity from the color, and only apply the opacity in stopOpacity, so in web
  // it isn't applied twice.
  const startColorWoOpacity = startColord.alpha(1).toHex();
  const finalColorWoOpacity = finalColord.alpha(1).toHex();

  const startColorOpacity = startColord.alpha();
  const finalColorOpacity = finalColord.alpha();

  // Fragment wasn't working for some reason, so, using array.
  const linearGradient = [
    // [*1] In mobile, it's required for the alpha to be set in opacity prop to work.
    // In web, smaller offsets needs to come before, so offset={0} definition comes first.
    <Stop offset={0} stopColor={startColorWoOpacity} stopOpacity={startColorOpacity} key='1'/>,
    <Stop offset={1} stopColor={finalColorWoOpacity} stopOpacity={finalColorOpacity} key='2'/>,
  ];

  const radialGradient2 = (p: RadialGradientPropsOmited) => radialGradient({
    ...p, startColorWoOpacity, startColorOpacity, finalColorWoOpacity, finalColorOpacity,
  });

  const cornerShadowRadius: CornerRadiusShadow = {
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


  return (
    <View pointerEvents='none' {...shadowViewProps} style={[
      StyleSheet.absoluteFillObject, { left: offset?.[0] ?? 0, top: offset?.[1] ?? 0 }, shadowViewProps?.style,
    ]}
    >
      {/* Sides */}
      {activeSides.left && <Svg
        width={distanceWithAdditional} height={heightWithAdditional}
        style={{ position: 'absolute', left: -distance, top: topLeft, ...rtlStyle }}
      >
        <Defs><LinearGradient id='left' x1='1' y1='0' x2='0' y2='0'>{linearGradient}</LinearGradient></Defs>
        {/* I was using a Mask here to remove part of each side (same size as now, sum of related corners), but,
                  just moving the rectangle outside its viewbox is already a mask!! -> svg overflow is cutten away. <- */}
        <Rect width={distance} height={height} fill='url(#left)' y={-sumDps(topLeft, bottomLeft)}/>
      </Svg>}
      {activeSides.right && <Svg
        width={distanceWithAdditional} height={heightWithAdditional}
        style={{ position: 'absolute', left: width, top: topRight, ...rtlStyle }}
      >
        <Defs><LinearGradient id='right' x1='0' y1='0' x2='1' y2='0'>{linearGradient}</LinearGradient></Defs>
        <Rect width={distance} height={height} fill='url(#right)' y={-sumDps(topRight, bottomRight)}/>
      </Svg>}
      {activeSides.bottom && <Svg
        width={widthWithAdditional} height={distanceWithAdditional}
        style={{ position: 'absolute', top: height, left: bottomLeft, ...rtlStyle }}
      >
        <Defs><LinearGradient id='bottom' x1='0' y1='0' x2='0' y2='1'>{linearGradient}</LinearGradient></Defs>
        <Rect width={width} height={distance} fill='url(#bottom)' x={-sumDps(bottomLeft, bottomRight)}/>
      </Svg>}
      {activeSides.top && <Svg
        width={widthWithAdditional} height={distanceWithAdditional}
        style={{ position: 'absolute', top: -distance, left: topLeft, ...rtlStyle }}
      >
        <Defs><LinearGradient id='top' x1='0' y1='1' x2='0' y2='0'>{linearGradient}</LinearGradient></Defs>
        <Rect width={width} height={distance} fill='url(#top)' x={-sumDps(topLeft, topRight)}/>
      </Svg>}


      {/* Corners */}
      {/* The anchor for the svgs path is the top left point in the corner square.
              The starting point is the clockwise external arc init point. */}
      {activeCorners.topLeft && <Svg width={topLeftShadow + additional} height={topLeftShadow + additional}
        style={{ position: 'absolute', top: -distance, left: -distance, ...rtlStyle }}
      >
        <Defs>{radialGradient2({ id: 'topLeft', top: true, left: true, radius: topLeft, shadowRadius: topLeftShadow })}</Defs>
        <Path fill='url(#topLeft)' d={`M0,${topLeftShadow} a${topLeftShadow},${topLeftShadow} 0 0 1 ${topLeftShadow} ${-topLeftShadow} v${distance} ${paintInside
          ? `v${topLeft} h${-topLeft}` // read [*2] below for the explanation for this
          : `a${topLeft},${topLeft} 0 0 0 ${-topLeft},${topLeft}`} h${-distance} Z`}/>
      </Svg>}
      {activeCorners.topRight && <Svg width={topRightShadow + additional} height={topRightShadow + additional}
        style={{
          position: 'absolute', top: -distance, left: width,
          transform: [{ translateX: isRTL ? topRight : -topRight }, ...rtlTransform],
        }}
      >
        <Defs>{radialGradient2({ id: 'topRight', top: true, left: false, radius: topRight, shadowRadius: topRightShadow })}</Defs>
        <Path fill='url(#topRight)' d={`M0,0 a${topRightShadow},${topRightShadow} 0 0 1 ${topRightShadow},${topRightShadow} h${-distance} ${paintInside
          ? `h${-topRight} v${-topLeft}`
          : `a${topRight},${topRight} 0 0 0 ${-topRight},${-topRight}`} v${-distance} Z`}/>
        {/*  */}
      </Svg>}
      {activeCorners.bottomLeft && <Svg width={bottomLeftShadow + additional} height={bottomLeftShadow + additional}
        style={{ position: 'absolute', top: height, left: -distance, transform: [{ translateY: -bottomLeft }, ...rtlTransform] }}
      >
        <Defs>{radialGradient2({ id: 'bottomLeft', top: false, left: true, radius: bottomLeft, shadowRadius: bottomLeftShadow })}</Defs>
        <Path fill='url(#bottomLeft)' d={`M${bottomLeftShadow},${bottomLeftShadow} a${bottomLeftShadow},${bottomLeftShadow} 0 0 1 ${-bottomLeftShadow},${-bottomLeftShadow} h${distance} ${paintInside
          ? `h${bottomLeft} v${bottomLeft}`
          : `a${bottomLeft},${bottomLeft} 0 0 0 ${bottomLeft},${bottomLeft}`} v${distance} Z`}/>
      </Svg>}
      {activeCorners.bottomRight && <Svg width={bottomRightShadow + additional} height={bottomRightShadow + additional}
        style={{
          position: 'absolute', top: height, left: width,
          transform: [{ translateX: isRTL ? bottomRight : -bottomRight }, { translateY: -bottomRight }, ...rtlTransform],
        }}
      >
        <Defs>{radialGradient2({ id: 'bottomRight', top: false, left: false, radius: bottomRight, shadowRadius: bottomRightShadow })}</Defs>
        <Path fill='url(#bottomRight)' d={`M${bottomRightShadow},0 a${bottomRightShadow},${bottomRightShadow} 0 0 1 ${-bottomRightShadow},${bottomRightShadow} v${-distance} ${paintInside
          ? `v${-bottomRight} h${bottomRight}`
          : `a${bottomRight},${bottomRight} 0 0 0 ${bottomRight},${-bottomRight}`} h${distance} Z`}/>
      </Svg>}

      {/* Paint the inner area, so we can offset it.
      [*2]: I tried redrawing the inner corner arc, but there would always be a small gap between the external shadows
      and this internal shadow along the curve. So, instead we dont specify the inner arc on the corners when
      paintBelow, but just use a square inner corner. And here we will just mask those squares in each corner. */}
      {paintInside && <Svg width={widthWithAdditional} height={heightWithAdditional} style={{ position: 'absolute', ...rtlStyle }}>
        {(typeof width === 'number' && typeof height === 'number')
        // Maybe due to how react-native-svg handles masks in iOS, the paintInside would have gaps: https://github.com/SrBrahma/react-native-shadow-2/issues/36
        // We use Path as workaround to it.
          ? (<Path fill={startColord.toHex()} d={`M0,${topLeft} v${height - bottomLeft - topLeft} h${bottomLeft} v${bottomLeft} h${width - bottomLeft - bottomRight} v${-bottomRight} h${bottomRight} v${-height + bottomRight + topRight} h${-topRight} v${-topRight} h${-width + topLeft + topRight} v${topLeft} Z`}/>)
          : (<>
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
          </>)}
      </Svg>}
    </View>
  );
}