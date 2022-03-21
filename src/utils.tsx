import { ViewStyle } from 'react-native';
import { RadialGradient, Stop } from 'react-native-svg';



export type Side = 'left' | 'right' | 'top' | 'bottom';
export type Corner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
export type CornerRadius = Record<Corner, number>;
// Add Shadow to the corner names
export type CornerRadiusShadow = Record<`${Corner}Shadow`, number>;

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