import { PixelRatio, Platform, ViewStyle } from 'react-native';
import { RadialGradient, Stop } from 'react-native-svg';



/** Package Semver. Used on the [Snack](https://snack.expo.dev/@srbrahma/react-native-shadow-2-sandbox)
 * and somehow may be useful to you. */
export const version = '7.0.0';


/** Util type to prettify the given type. */
type Id<T> = unknown & { [P in keyof T]: T[P] };

export type Side = 'left' | 'right' | 'top' | 'bottom';
export type Corner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
export type CornerRadius = Record<Corner, number>;

// Add Shadow to the corner names
export type CornerRadiusShadow = Record<`${Corner}Shadow`, number>;

/** Type of `radius` property. */
export type RadiusProp = number | Id<Partial<CornerRadius> & {default?: number}>;

export const cornersArray = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const;
// const cornersShadowArray = ['topLeftShadow', 'topRightShadow', 'bottomLeftShadow', 'bottomRightShadow'] as const;
export const sidesArray = ['left', 'right', 'top', 'bottom'] as const;



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
export function P(value: number): number {
  if (isWeb) return value;
  return PixelRatio.getPixelSizeForLayoutSize(value);
}
/** How many pixels for each dp. scale = pixels/dp */
const scale = isWeb ? 1 : PixelRatio.get();

/** Converts two sizes to pixel for perfect math, sum them and converts the result back to dp. */
export function sumDps(a: number, b: number): number {
  if (isWeb) return a + b;
  return R((P(a) + P(b)) / scale);
}


/** [Android/ios?] [*4] A small safe margin for the svg sizes.
 *
 * It fixes some gaps that we had, as even that the svg size and the svg rect for example size were the same, this rect
 * would still strangely be cropped/clipped. We give this additional size to the svg so our rect/etc won't be unintendedly clipped.
 *
 * It doesn't mean 1 pixel, as RN uses dp sizing, it's just an arbitrary and big enough number. */
export const additional = isWeb ? 0 : 1;

/** Auxilary function to shorten code */
export function objFromKeys<KeysArray extends Readonly<string[]>, Rtn>(keys: KeysArray, fun: (key: KeysArray[number]) => Rtn): Record<KeysArray[number], Rtn> {
  return keys.reduce((obj, key) => ({ ...obj, [key]: fun(key) }), {} as Record<string, any>);
}

export function cornerToStyle(corner: Corner, alternative: boolean): keyof ViewStyle {
  switch (corner) {
    case 'topLeft': return alternative ? 'borderTopStartRadius' : 'borderTopLeftRadius';
    case 'topRight': return alternative ? 'borderTopEndRadius' : 'borderTopRightRadius';
    case 'bottomLeft': return alternative ? 'borderBottomStartRadius' : 'borderBottomLeftRadius';
    case 'bottomRight': return alternative ? 'borderBottomEndRadius' : 'borderBottomRightRadius';
  }
}

type RadialGradientProps = {
  id: string;
  top: boolean;
  left: boolean;
  radius: number;
  shadowRadius: number;
  startColorWoOpacity: string;
  startColorOpacity: number;
  finalColorWoOpacity: string;
  finalColorOpacity: number;
};
export type RadialGradientPropsOmited = Omit<RadialGradientProps, `${'start' | 'final'}${string}`>;

export function radialGradient({
  id, left, radius, shadowRadius, top, startColorWoOpacity, startColorOpacity, finalColorWoOpacity, finalColorOpacity,
}: RadialGradientProps): JSX.Element {
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