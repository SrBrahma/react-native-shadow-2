import { ViewStyle } from 'react-native';


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