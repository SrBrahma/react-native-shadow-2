/** Auxilary function to shorten code */
export function objFromKeys<KeysArray extends Readonly<string[]>>(keys: KeysArray, fun: (key: KeysArray[number]) => any): Record<KeysArray[number], any> {
  return keys.reduce((obj, key) => ({ ...obj, [key]: fun(key) }), {} as Record<string, any>);
}

// https://stackoverflow.com/a/1026087/10247962
export function uppercaseFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}