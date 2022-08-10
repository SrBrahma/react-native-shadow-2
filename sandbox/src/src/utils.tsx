// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
import React from 'react';
import { PixelRatio, Platform } from 'react-native';
import { RadialGradient, Stop } from 'react-native-svg';


export type Side = 'start' | 'end' | 'top' | 'bottom';
export type Corner = 'topStart' | 'topEnd' | 'bottomStart' | 'bottomEnd';
export type CornerRadius = Record<Corner, number>;

// Add Shadow to the corner names
export type CornerRadiusShadow = Record<`${Corner}Shadow`, number>;


/** Package Semver. Used on the [Snack](https://snack.expo.dev/@srbrahma/react-native-shadow-2-sandbox)
 * and somehow may be useful to you. */
export const version = '7.0.0';

export const cornersArray = ['topStart', 'topEnd', 'bottomStart', 'bottomEnd'] as const;

const isWeb = Platform.OS === 'web';

/** Rounds the given size to a pixel perfect size. */
export const R: (value: number) => number = isWeb
  // In Web, 1dp=1px. But it accepts decimal sizes, and it's somewhat problematic.
  // The size rounding is browser-dependent, so we do the decimal rounding for web by ourselves to have a
  // consistent behavior. We floor it, because it's better for the child to overlap by a pixel the right/bottom shadow part
  // than to have a pixel wide gap between them.
  ? Math.floor
  : PixelRatio.roundToNearestPixel;

/** Converts dp to pixels. */
export const P: (value: number) => number = isWeb
  ? (v) => v
  : PixelRatio.getPixelSizeForLayoutSize;

/** How many pixels for each dp. scale = pixels/dp */
export const scale = isWeb ? 1 : PixelRatio.get();

/** Converts two sizes to pixel for perfect math, sums them and converts the result back to dp. */
export const sumDps: (a: number, b: number) => number = isWeb
  ? (a, b) => a + b
  : (a, b) => R((P(a) + P(b)) / scale);

/** Converts two sizes to pixel for perfect math, divides them and converts the result back to dp. */
export const divDps: (a: number, b: number) => number = isWeb
  ? (a, b) => a / b
  : (a, b) => (P(a) / P(b));


/** [Android/ios?] [*4] A small safe margin for the svg sizes.
 *
 * It fixes some gaps that we had, as even that the svg size and the svg rect for example size were the same, this rect
 * would still strangely be cropped/clipped. We give this additional size to the svg so our rect/etc won't be unintendedly clipped.
 *
 * It doesn't mean 1 pixel, as RN uses dp sizing, it's just an arbitrary and big enough number. */
export const additional = isWeb ? 0 : 1;

/** Auxilary function to shorten code */
export function objFromKeys<KeysArray extends Readonly<string[]>, Rtn>(keys: KeysArray, fun: (key: KeysArray[number]) => Rtn): Record<KeysArray[number], Rtn> {
  const result: Record<KeysArray[number], Rtn> = {} as any;
  for (const key of keys)
    result[key as KeysArray[number]] = fun(key);
  return result;
}

export const cornerToStyle = {
  topLeft: ['borderTopLeftRadius', 'borderTopStartRadius'],
  topRight: ['borderTopRightRadius', 'borderTopEndRadius'],
  bottomLeft: ['borderBottomLeftRadius', 'borderBottomStartRadius'],
  bottomRight: ['borderBottomRightRadius', 'borderBottomEndRadius'],
} as const;

type RadialGradientProps = {
  id: string;
  top: boolean;
  left: boolean;
  radius: number;
  shadowRadius: number;
  startColorWoOpacity: string;
  startColorOpacity: number;
  endColorWoOpacity: string;
  endColorOpacity: number;
  paintInside: boolean;
};
export type RadialGradientPropsOmited = Omit<RadialGradientProps, `${'start' | 'end' | 'paintInside'}${string}`>;

export function radialGradient({
  id, left, radius, shadowRadius, top, startColorWoOpacity, startColorOpacity, endColorWoOpacity, endColorOpacity, paintInside,
}: RadialGradientProps): JSX.Element {
  return (<RadialGradient
    id={id}
    cx={left ? shadowRadius : 0}
    cy={top ? shadowRadius : 0}
    r={shadowRadius}
    gradientUnits='userSpaceOnUse' // won't show if this isn't set
  >
    {!paintInside && <Stop offset={radius / shadowRadius} stopOpacity={0}/>}
    {/* Bad. There would be a tiny gap between the child and the corner shadow. */}
    <Stop offset={radius / shadowRadius} stopColor={startColorWoOpacity} stopOpacity={startColorOpacity}/>
    <Stop offset={1} stopColor={endColorWoOpacity} stopOpacity={endColorOpacity}/>
  </RadialGradient>);
}

/** Generates a sufficiently unique suffix to add to gradient ids and prevent collisions.
 *
 * https://github.com/SrBrahma/react-native-shadow-2/pull/54 */
export const generateGradientIdSuffix = (() => {
  let shadowGradientIdCounter = 0;
  return () => String(shadowGradientIdCounter++);
})();

export const rtlScaleX = { transform: [{ scaleX: -1 }] };