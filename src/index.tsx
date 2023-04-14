// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import React, { Children, useMemo, useState } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import { I18nManager, StyleSheet, View } from 'react-native';
import { Defs, LinearGradient, Mask, Path, Rect, Stop, Svg } from 'react-native-svg';
import { colord } from 'colord';
import type {
  Corner,
  CornerRadius,
  CornerRadiusShadow,
  RadialGradientPropsOmited,
  Side,
} from './utils';
import {
  additional,
  cornersArray,
  divDps,
  generateGradientIdSuffix,
  objFromKeys,
  P,
  R,
  radialGradient,
  rtlScaleX,
  scale,
  sumDps,
} from './utils';

/** Package Semver. Used on the [Snack](https://snack.expo.dev/@srbrahma/react-native-shadow-2-sandbox). */
export const version = '7.0.7';

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
  endColor?: string;
  /** How far the shadow goes.
   * @default 10 */
  distance?: number;
  /** The sides that have the shadows drawn. Doesn't include corners.
   *
   * Undefined sides fallbacks to true.
   *
   * @default undefined */
  // We are using the raw type here instead of Side/Corner so TypeDoc/Readme output is better for the users, won't be just `Side`.
  sides?: Record<'start' | 'end' | 'top' | 'bottom', boolean>;
  /** The corners that have the shadows drawn.
   *
   * Undefined corners fallbacks to true.
   *
   * @default undefined */
  corners?: Record<'topStart' | 'topEnd' | 'bottomStart' | 'bottomEnd', boolean>;
  /** Moves the shadow. Negative x moves it to the left, negative y moves it up.
   *
   * Accepts `'x%'` values, in relation to the child's size.
   *
   * Setting an offset will default `paintInside` to true.
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
  /** Style of the View that wraps your child component.
   *
   * You may set here the corners radii (e.g. borderTopLeftRadius) and the width/height. */
  style?: StyleProp<ViewStyle>;
  /** Style of the view that wraps the shadow and your child component. */
  containerStyle?: StyleProp<ViewStyle>;
  /** If you don't want the relative sizing and positioning of the shadow on the first render, but only on the second render and
   * beyond with the exact onLayout's sizes. This is useful if dealing with radius greater than the sizes, to assure
   * the fully round corners when the sides sizes are unknown and to avoid weird and overflowing shadows on the first render.
   *
   * Note that when true, the shadow won't appear on the first render.
   *
   * @default false */
  safeRender?: boolean;
  /** Use this when you want your children to ocuppy all available cross-axis/horizontal space.
   *
   * Shortcut to `style={{alignSelf: 'stretch'}}.
   *
   * [Explanation](https://github.com/SrBrahma/react-native-shadow-2/issues/7#issuecomment-899784537)
   *
   * @default false */
  stretch?: boolean;
  /** Won't render the Shadow. Useful for reusing components as sometimes shadows are not wanted.
   *
   * The children will be wrapped by two Views. `containerStyle` and `style` are still applied.
   *
   * For performance, contrary to `disabled={false}`, the children's corners radii aren't set in `style`.
   * This is done in "enabled" to limit Pressable's ripple as we already obtain those values.
   *
   * @default false */
  disabled?: boolean;
  /** Props for the container's wrapping View. You probably don't need to use this. */
  containerViewProps?: ViewProps;
  /** Props for the shadow's wrapping View. You probably don't need to use this. You may pass `style` to this. */
  shadowViewProps?: ViewProps;
  /** Props for the children's wrapping View. You probably't don't need to use this. */
  childrenViewProps?: ViewProps;
  /** Your child component. */
  children?: React.ReactNode;
}

// For better memoization and performance.
const emptyObj: Record<string, unknown> = {};
const defaultOffset = [0, 0] as [x: number | string, y: number | string];

export function Shadow(props: ShadowProps): JSX.Element {
  return props.disabled ? <DisabledShadow {...props} /> : <ShadowInner {...props} />;
}

function ShadowInner(props: ShadowProps): JSX.Element {
  /** getConstants().isRTL instead of just isRTL due to Web https://github.com/necolas/react-native-web/issues/2350#issuecomment-1193642853 */
  const isRTL = I18nManager.getConstants().isRTL;
  const [childLayoutWidth, setChildLayoutWidth] = useState<number | undefined>();
  const [childLayoutHeight, setChildLayoutHeight] = useState<number | undefined>();
  const [idSuffix] = useState<string>(generateGradientIdSuffix);

  const {
    sides,
    corners,
    startColor: startColorProp,
    endColor: endColorProp,
    distance: distanceProp,
    style: styleProp,
    safeRender,
    stretch,
    /** Defaults to true if offset is defined, else defaults to false */
    paintInside = props.offset ? true : false,
    offset = defaultOffset,
    children,
    containerStyle,
    shadowViewProps,
    childrenViewProps,
    containerViewProps,
  } = props;

  /** `s` is a shortcut for `style` I am using in another lib of mine (react-native-gev). While currently no one uses it besides me,
   * I believe it may come to be a popular pattern eventually :) */
  const childProps: { style?: ViewStyle; s?: ViewStyle } =
    Children.count(children) === 1
      ? (Children.only(children) as JSX.Element).props ?? emptyObj
      : emptyObj;

  const childStyleStr: string | null = useMemo(
    () => (childProps.style ? JSON.stringify(childProps.style) : null),
    [childProps.style],
  );
  const childSStr: string | null = useMemo(
    () => (childProps.s ? JSON.stringify(childProps.s) : null),
    [childProps.s],
  );

  /** Child's style. */
  const cStyle: ViewStyle = useMemo(() => {
    const cStyle = StyleSheet.flatten<ViewStyle>([
      childStyleStr && JSON.parse(childStyleStr),
      childSStr && JSON.parse(childSStr),
    ]);
    if (typeof cStyle.width === 'number') cStyle.width = R(cStyle.width);
    if (typeof cStyle.height === 'number') cStyle.height = R(cStyle.height);
    return cStyle;
  }, [childSStr, childStyleStr]);

  /** Child's Radii. */
  const cRadii: Record<Corner, number | undefined> = useMemo(() => {
    return {
      topStart: cStyle.borderTopStartRadius ?? cStyle.borderTopLeftRadius ?? cStyle.borderRadius,
      topEnd: cStyle.borderTopEndRadius ?? cStyle.borderTopRightRadius ?? cStyle.borderRadius,
      bottomStart:
        cStyle.borderBottomStartRadius ?? cStyle.borderBottomLeftRadius ?? cStyle.borderRadius,
      bottomEnd:
        cStyle.borderBottomEndRadius ?? cStyle.borderBottomRightRadius ?? cStyle.borderRadius,
    };
  }, [cStyle]);

  const styleStr: string | null = useMemo(
    () => (styleProp ? JSON.stringify(styleProp) : null),
    [styleProp],
  );

  /** Flattened style. */
  const { style, sRadii }: { style: ViewStyle; sRadii: Record<Corner, number | undefined> } =
    useMemo(() => {
      const style = styleStr ? StyleSheet.flatten<ViewStyle>(JSON.parse(styleStr)) : {};
      if (typeof style.width === 'number') style.width = R(style.width);
      if (typeof style.height === 'number') style.height = R(style.height);
      return {
        style,
        sRadii: {
          topStart: style.borderTopStartRadius ?? style.borderTopLeftRadius ?? style.borderRadius,
          topEnd: style.borderTopEndRadius ?? style.borderTopRightRadius ?? style.borderRadius,
          bottomStart:
            style.borderBottomStartRadius ?? style.borderBottomLeftRadius ?? style.borderRadius,
          bottomEnd:
            style.borderBottomEndRadius ?? style.borderBottomRightRadius ?? style.borderRadius,
        },
      };
    }, [styleStr]);

  const styleWidth = style.width ?? cStyle.width;
  const width = styleWidth ?? childLayoutWidth ?? '100%'; // '100%' sometimes will lead to gaps. Child's size don't lie.
  const styleHeight = style.height ?? cStyle.height;
  const height = styleHeight ?? childLayoutHeight ?? '100%';

  const radii: CornerRadius = useMemo(
    () =>
      sanitizeRadii({
        width,
        height,
        radii: {
          topStart: sRadii.topStart ?? cRadii.topStart,
          topEnd: sRadii.topEnd ?? cRadii.topEnd,
          bottomStart: sRadii.bottomStart ?? cRadii.bottomStart,
          bottomEnd: sRadii.bottomEnd ?? cRadii.bottomEnd,
        },
      }),
    [
      width,
      height,
      sRadii.topStart,
      sRadii.topEnd,
      sRadii.bottomStart,
      sRadii.bottomEnd,
      cRadii.topStart,
      cRadii.topEnd,
      cRadii.bottomStart,
      cRadii.bottomEnd,
    ],
  );

  const { topStart, topEnd, bottomStart, bottomEnd } = radii;

  const shadow = useMemo(
    () =>
      getShadow({
        topStart,
        topEnd,
        bottomStart,
        bottomEnd,
        width,
        height,
        isRTL,
        distanceProp,
        startColorProp,
        endColorProp,
        paintInside,
        safeRender,
        activeSides: {
          bottom: sides?.bottom ?? true,
          top: sides?.top ?? true,
          start: sides?.start ?? true,
          end: sides?.end ?? true,
        },
        activeCorners: {
          topStart: corners?.topStart ?? true,
          topEnd: corners?.topEnd ?? true,
          bottomStart: corners?.bottomStart ?? true,
          bottomEnd: corners?.bottomEnd ?? true,
        },
        idSuffix,
      }),
    [
      width,
      height,
      distanceProp,
      startColorProp,
      endColorProp,
      topStart,
      topEnd,
      bottomStart,
      bottomEnd,
      paintInside,
      sides?.bottom,
      sides?.top,
      sides?.start,
      sides?.end,
      corners?.topStart,
      corners?.topEnd,
      corners?.bottomStart,
      corners?.bottomEnd,
      safeRender,
      isRTL,
      idSuffix,
    ],
  );

  // Not yet sure if we should memo this.
  return getResult({
    shadow,
    children,
    stretch,
    offset,
    radii,
    containerStyle,
    style,
    shadowViewProps,
    setChildLayoutWidth,
    setChildLayoutHeight,
    childrenViewProps,
    containerViewProps,
    styleWidth,
    styleHeight,
    layoutWidth: childLayoutWidth,
    layoutHeight: childLayoutHeight,
  });
}

/** We make some effort for this to be likely memoized */
function sanitizeRadii({
  width,
  height,
  radii,
}: {
  width: string | number;
  height: string | number;
  /** Not yet treated. May be negative / undefined */
  radii: {
    topStart: number | undefined;
    topEnd: number | undefined;
    bottomStart: number | undefined;
    bottomEnd: number | undefined;
  };
}): CornerRadius {
  /** Round and zero negative radius values */
  let radiiSanitized = objFromKeys(cornersArray, (k) => R(Math.max(radii[k] ?? 0, 0)));

  if (typeof width === 'number' && typeof height === 'number') {
    // https://css-tricks.com/what-happens-when-border-radii-overlap/
    // Note that the tutorial above doesn't mention the specification of minRatio < 1 but it's required as said on spec and will malfunction without it.
    const minRatio = Math.min(
      divDps(width, sumDps(radiiSanitized.topStart, radiiSanitized.topEnd)),
      divDps(height, sumDps(radiiSanitized.topEnd, radiiSanitized.bottomEnd)),
      divDps(width, sumDps(radiiSanitized.bottomStart, radiiSanitized.bottomEnd)),
      divDps(height, sumDps(radiiSanitized.topStart, radiiSanitized.bottomStart)),
    );

    if (minRatio < 1)
      // We ensure to use the .floor instead of the R else we could have the following case:
      // A topStart=3, topEnd=3 and width=5. This would cause a pixel overlap between those 2 corners.
      // The .floor ensures that the radii sum will be below the adjacent border length.
      radiiSanitized = objFromKeys(
        cornersArray,
        (k) => Math.floor(P(radiiSanitized[k]) * minRatio) / scale,
      );
  }

  return radiiSanitized;
}

/** The SVG parts. */
// We default the props here for a micro improvement in performance. endColorProp default value was the main reason.
function getShadow({
  safeRender,
  width,
  height,
  isRTL,
  distanceProp = 10,
  startColorProp = '#00000020',
  endColorProp = colord(startColorProp).alpha(0).toHex(),
  topStart,
  topEnd,
  bottomStart,
  bottomEnd,
  activeSides,
  activeCorners,
  paintInside,
  idSuffix,
}: {
  safeRender: boolean | undefined;
  width: string | number;
  height: string | number;
  isRTL: boolean;
  distanceProp?: number;
  startColorProp?: string;
  endColorProp?: string;
  topStart: number;
  topEnd: number;
  bottomStart: number;
  bottomEnd: number;
  activeSides: Record<Side, boolean>;
  activeCorners: Record<Corner, boolean>;
  paintInside: boolean;
  idSuffix: string;
}): JSX.Element | null {
  // Skip if using safeRender and we still don't have the exact sizes, if we are still on the first render using the relative sizes.
  if (safeRender && (typeof width === 'string' || typeof height === 'string')) return null;

  const distance = R(Math.max(distanceProp, 0)); // Min val as 0

  // Quick return if not going to show up anything
  if (!distance && !paintInside) return null;

  const distanceWithAdditional = distance + additional;

  /** Will (+ additional), only if its value isn't '100%'. [*4] */
  const widthWithAdditional = typeof width === 'string' ? width : width + additional;
  /** Will (+ additional), only if its value isn't '100%'. [*4] */
  const heightWithAdditional = typeof height === 'string' ? height : height + additional;

  const startColord = colord(startColorProp);
  const endColord = colord(endColorProp);

  // [*1]: Seems that SVG in web accepts opacity in hex color, but in mobile gradient doesn't.
  // So we remove the opacity from the color, and only apply the opacity in stopOpacity, so in web
  // it isn't applied twice.
  const startColorWoOpacity = startColord.alpha(1).toHex();
  const endColorWoOpacity = endColord.alpha(1).toHex();

  const startColorOpacity = startColord.alpha();
  const endColorOpacity = endColord.alpha();

  // Fragment wasn't working for some reason, so, using array.
  const linearGradient = [
    // [*1] In mobile, it's required for the alpha to be set in opacity prop to work.
    // In web, smaller offsets needs to come before, so offset={0} definition comes first.
    <Stop offset={0} stopColor={startColorWoOpacity} stopOpacity={startColorOpacity} key='1' />,
    <Stop offset={1} stopColor={endColorWoOpacity} stopOpacity={endColorOpacity} key='2' />,
  ];

  const radialGradient2 = (p: RadialGradientPropsOmited) =>
    radialGradient({
      ...p,
      startColorWoOpacity,
      startColorOpacity,
      endColorWoOpacity,
      endColorOpacity,
      paintInside,
    });

  const cornerShadowRadius: CornerRadiusShadow = {
    topStartShadow: sumDps(topStart, distance),
    topEndShadow: sumDps(topEnd, distance),
    bottomStartShadow: sumDps(bottomStart, distance),
    bottomEndShadow: sumDps(bottomEnd, distance),
  };

  const { topStartShadow, topEndShadow, bottomStartShadow, bottomEndShadow } = cornerShadowRadius;

  return (
    <>
      {/* Skip sides if we don't have a distance. */}
      {distance > 0 && (
        <>
          {/* Sides */}
          {activeSides.start && (
            <Svg
              width={distanceWithAdditional}
              height={heightWithAdditional}
              style={{ position: 'absolute', start: -distance, top: topStart }}
            >
              <Defs>
                <LinearGradient
                  id={`start.${idSuffix}`}
                  x1={isRTL ? '0' : '1'}
                  y1='0'
                  x2={isRTL ? '1' : '0'}
                  y2='0'
                >
                  {linearGradient}
                </LinearGradient>
              </Defs>
              {/* I was using a Mask here to remove part of each side (same size as now, sum of related corners), but,
                  just moving the rectangle outside its viewbox is already a mask!! -> svg overflow is cutten away. <- */}
              <Rect
                width={distance}
                height={height}
                fill={`url(#start.${idSuffix})`}
                y={-sumDps(topStart, bottomStart)}
              />
            </Svg>
          )}
          {activeSides.end && (
            <Svg
              width={distanceWithAdditional}
              height={heightWithAdditional}
              style={{ position: 'absolute', start: width, top: topEnd }}
            >
              <Defs>
                <LinearGradient
                  id={`end.${idSuffix}`}
                  x1={isRTL ? '1' : '0'}
                  y1='0'
                  x2={isRTL ? '0' : '1'}
                  y2='0'
                >
                  {linearGradient}
                </LinearGradient>
              </Defs>
              <Rect
                width={distance}
                height={height}
                fill={`url(#end.${idSuffix})`}
                y={-sumDps(topEnd, bottomEnd)}
              />
            </Svg>
          )}
          {activeSides.top && (
            <Svg
              width={widthWithAdditional}
              height={distanceWithAdditional}
              style={{
                position: 'absolute',
                top: -distance,
                start: topStart,
                ...(isRTL && rtlScaleX),
              }}
            >
              <Defs>
                <LinearGradient id={`top.${idSuffix}`} x1='0' y1='1' x2='0' y2='0'>
                  {linearGradient}
                </LinearGradient>
              </Defs>
              <Rect
                width={width}
                height={distance}
                fill={`url(#top.${idSuffix})`}
                x={-sumDps(topStart, topEnd)}
              />
            </Svg>
          )}
          {activeSides.bottom && (
            <Svg
              width={widthWithAdditional}
              height={distanceWithAdditional}
              style={{
                position: 'absolute',
                top: height,
                start: bottomStart,
                ...(isRTL && rtlScaleX),
              }}
            >
              <Defs>
                <LinearGradient id={`bottom.${idSuffix}`} x1='0' y1='0' x2='0' y2='1'>
                  {linearGradient}
                </LinearGradient>
              </Defs>
              <Rect
                width={width}
                height={distance}
                fill={`url(#bottom.${idSuffix})`}
                x={-sumDps(bottomStart, bottomEnd)}
              />
            </Svg>
          )}
        </>
      )}

      {/* Corners */}
      {/* The anchor for the svgs path is the top left point in the corner square.
              The starting point is the clockwise external arc init point. */}
      {/* Checking topLeftShadowEtc > 0 due to https://github.com/SrBrahma/react-native-shadow-2/issues/47. */}
      {activeCorners.topStart && topStartShadow > 0 && (
        <Svg
          width={topStartShadow + additional}
          height={topStartShadow + additional}
          style={{ position: 'absolute', top: -distance, start: -distance }}
        >
          <Defs>
            {radialGradient2({
              id: `topStart.${idSuffix}`,
              top: true,
              left: !isRTL,
              radius: topStart,
              shadowRadius: topStartShadow,
            })}
          </Defs>
          <Rect
            fill={`url(#topStart.${idSuffix})`}
            width={topStartShadow}
            height={topStartShadow}
          />
        </Svg>
      )}
      {activeCorners.topEnd && topEndShadow > 0 && (
        <Svg
          width={topEndShadow + additional}
          height={topEndShadow + additional}
          style={{
            position: 'absolute',
            top: -distance,
            start: width,
            transform: [{ translateX: isRTL ? topEnd : -topEnd }],
          }}
        >
          <Defs>
            {radialGradient2({
              id: `topEnd.${idSuffix}`,
              top: true,
              left: isRTL,
              radius: topEnd,
              shadowRadius: topEndShadow,
            })}
          </Defs>
          <Rect fill={`url(#topEnd.${idSuffix})`} width={topEndShadow} height={topEndShadow} />
        </Svg>
      )}
      {activeCorners.bottomStart && bottomStartShadow > 0 && (
        <Svg
          width={bottomStartShadow + additional}
          height={bottomStartShadow + additional}
          style={{
            position: 'absolute',
            top: height,
            start: -distance,
            transform: [{ translateY: -bottomStart }],
          }}
        >
          <Defs>
            {radialGradient2({
              id: `bottomStart.${idSuffix}`,
              top: false,
              left: !isRTL,
              radius: bottomStart,
              shadowRadius: bottomStartShadow,
            })}
          </Defs>
          <Rect
            fill={`url(#bottomStart.${idSuffix})`}
            width={bottomStartShadow}
            height={bottomStartShadow}
          />
        </Svg>
      )}
      {activeCorners.bottomEnd && bottomEndShadow > 0 && (
        <Svg
          width={bottomEndShadow + additional}
          height={bottomEndShadow + additional}
          style={{
            position: 'absolute',
            top: height,
            start: width,
            transform: [{ translateX: isRTL ? bottomEnd : -bottomEnd }, { translateY: -bottomEnd }],
          }}
        >
          <Defs>
            {radialGradient2({
              id: `bottomEnd.${idSuffix}`,
              top: false,
              left: isRTL,
              radius: bottomEnd,
              shadowRadius: bottomEndShadow,
            })}
          </Defs>
          <Rect
            fill={`url(#bottomEnd.${idSuffix})`}
            width={bottomEndShadow}
            height={bottomEndShadow}
          />
        </Svg>
      )}

      {/* Paint the inner area, so we can offset it.
      [*2]: I tried redrawing the inner corner arc, but there would always be a small gap between the external shadows
      and this internal shadow along the curve. So, instead we dont specify the inner arc on the corners when
      paintBelow, but just use a square inner corner. And here we will just mask those squares in each corner. */}
      {paintInside && (
        <Svg
          width={widthWithAdditional}
          height={heightWithAdditional}
          style={{ position: 'absolute', ...(isRTL && rtlScaleX) }}
        >
          {typeof width === 'number' && typeof height === 'number' ? (
            // Maybe due to how react-native-svg handles masks in iOS, the paintInside would have gaps: https://github.com/SrBrahma/react-native-shadow-2/issues/36
            // We use Path as workaround to it.
            <Path
              fill={startColorWoOpacity}
              fillOpacity={startColorOpacity}
              d={`M0,${topStart} v${
                height - bottomStart - topStart
              } h${bottomStart} v${bottomStart} h${
                width - bottomStart - bottomEnd
              } v${-bottomEnd} h${bottomEnd} v${
                -height + bottomEnd + topEnd
              } h${-topEnd} v${-topEnd} h${-width + topStart + topEnd} v${topStart} Z`}
            />
          ) : (
            <>
              <Defs>
                <Mask id={`maskInside.${idSuffix}`}>
                  {/* Paint all white, then black on border external areas to erase them */}
                  <Rect width={width} height={height} fill='#fff' />
                  {/* Remove the corners */}
                  <Rect width={topStart} height={topStart} fill='#000' />
                  <Rect
                    width={topEnd}
                    height={topEnd}
                    x={width}
                    transform={`translate(${-topEnd}, 0)`}
                    fill='#000'
                  />
                  <Rect
                    width={bottomStart}
                    height={bottomStart}
                    y={height}
                    transform={`translate(0, ${-bottomStart})`}
                    fill='#000'
                  />
                  <Rect
                    width={bottomEnd}
                    height={bottomEnd}
                    x={width}
                    y={height}
                    transform={`translate(${-bottomEnd}, ${-bottomEnd})`}
                    fill='#000'
                  />
                </Mask>
              </Defs>
              <Rect
                width={width}
                height={height}
                mask={`url(#maskInside.${idSuffix})`}
                fill={startColorWoOpacity}
                fillOpacity={startColorOpacity}
              />
            </>
          )}
        </Svg>
      )}
    </>
  );
}

function getResult({
  shadow,
  stretch,
  setChildLayoutWidth,
  setChildLayoutHeight,
  containerStyle,
  children,
  style,
  radii,
  offset,
  containerViewProps,
  shadowViewProps,
  childrenViewProps,
  styleWidth,
  styleHeight,
  layoutWidth,
  layoutHeight,
}: {
  radii: CornerRadius;
  containerStyle: StyleProp<ViewStyle>;
  shadow: JSX.Element | null;
  children: any;
  style: ViewStyle; // Already flattened
  stretch: boolean | undefined;
  setChildLayoutWidth: React.Dispatch<React.SetStateAction<number | undefined>>;
  setChildLayoutHeight: React.Dispatch<React.SetStateAction<number | undefined>>;
  offset: [x: number | string, y: number | string];
  containerViewProps: ViewProps | undefined;
  shadowViewProps: ViewProps | undefined;
  childrenViewProps: ViewProps | undefined;
  /** The style width. Tries to use the style prop then the child's style. */
  styleWidth: string | number | undefined;
  /** The style height. Tries to use the style prop then the child's style. */
  styleHeight: string | number | undefined;
  layoutWidth: number | undefined;
  layoutHeight: number | undefined;
}): JSX.Element {
  // const isWidthPrecise = styleWidth;

  return (
    // pointerEvents: https://github.com/SrBrahma/react-native-shadow-2/issues/24
    <View style={containerStyle} pointerEvents='box-none' {...containerViewProps}>
      <View
        pointerEvents='none'
        {...shadowViewProps}
        style={[
          StyleSheet.absoluteFillObject,
          shadowViewProps?.style,
          { start: offset[0], top: offset[1] },
        ]}
      >
        {shadow}
      </View>
      <View
        pointerEvents='box-none'
        style={[
          {
            // We are defining here the radii so when using radius props it also affects the backgroundColor and Pressable ripples are properly contained.
            // Note that topStart/etc has priority over topLeft/etc. We use topLeft so the user may overwrite it with topLeft or topStart styles.
            borderTopLeftRadius: radii.topStart,
            borderTopRightRadius: radii.topEnd,
            borderBottomLeftRadius: radii.bottomStart,
            borderBottomRightRadius: radii.bottomEnd,
            alignSelf: 'flex-start', // Default to 'flex-start' instead of 'stretch'.
          },
          style,
          // Without alignSelf: 'flex-start', if your Shadow component had a sibling under the same View, the shadow would try to have the same size of the sibling,
          // being it for example a text below the shadowed component. https://imgur.com/a/V6ZV0lI, https://github.com/SrBrahma/react-native-shadow-2/issues/7#issuecomment-899764882
          { ...(stretch && { alignSelf: 'stretch' }) },
        ]}
        onLayout={(e) => {
          // For some strange reason, attaching conditionally the onLayout wasn't working on condition change,
          // so we do the check before the state change.
          // [web] [*3]: the width/height we get here is already rounded by RN, even if the real size according to the browser
          // inspector is decimal. It will round up if (>= .5), else, down.
          const { width, height } = e.nativeEvent.layout;
          // Change layout state if the style width/height is undefined or 'x%', or the sizes in pixels are different.
          if (
            typeof styleWidth !== 'number' &&
            (layoutWidth === undefined || P(width) !== P(layoutWidth))
          )
            setChildLayoutWidth(width);
          if (
            typeof styleHeight !== 'number' &&
            (layoutHeight === undefined || P(height) !== P(layoutHeight))
          )
            setChildLayoutHeight(height);
        }}
        {...childrenViewProps}
      >
        {children}
      </View>
    </View>
  );
}

function DisabledShadow({
  stretch,
  containerStyle,
  children,
  style,
  childrenViewProps,
  containerViewProps,
}: {
  containerStyle?: StyleProp<ViewStyle>;
  children?: any;
  style?: StyleProp<ViewStyle>;
  stretch?: boolean;
  containerViewProps?: ViewProps;
  childrenViewProps?: ViewProps;
}): JSX.Element {
  return (
    <View style={containerStyle} pointerEvents='box-none' {...containerViewProps}>
      <View
        pointerEvents='box-none'
        {...childrenViewProps}
        style={[style, { ...(stretch && { alignSelf: 'stretch' }) }]}
      >
        {children}
      </View>
    </View>
  );
}
