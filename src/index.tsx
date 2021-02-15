// First I tried to use react-native-linear & radial-gradient (that uses react-native-svg),
// but they would, depending on device and view dimensions and positions, have a pixel between their views.
// So I decided to try using the svg directly.


import React, { useMemo, useState } from 'react';
import { LayoutRectangle, StyleProp, View, ViewStyle } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Rect,
  Stop,
  RadialGradient,
  Path
} from 'react-native-svg';
import { parseToRgb } from 'polished'; // To extract alpha
import type { RgbaColor } from 'polished/lib/types/color';


// experimental, trying to apply shadow without giving size and on same render.
// const ScreenWidth = Dimensions.get('screen').width;
// const ScreenHeight = Dimensions.get('screen').height;
// console.log(ScreenWidth, ScreenHeight, Dimensions.get('screen').scale);


type Size = [width: number, height: number];

// Exclude<x, never>: https://github.com/microsoft/TypeScript/issues/42322#issuecomment-759786099
type Sides = Exclude<'left' | 'right' | 'top' | 'bottom', never>;
type Corners = Exclude<'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', never>;


interface ShadowI {
  /** The width and height of your content, not including the shadow.
   *
   * If not defining it, the shadow will take 1 render to get the content size then render the shadow.
   *
   * ^ In the future there will be a callback that will be called when it's done. It takes milliseconds,
   * but may be perceptible.
   */
  size?: Size;
  /** The color of the shadow when it's right next to the given content, leaving it. */
  startColor: string;
  /** The color of the shadow at the maximum distance from the content.
   * @default '#0000', transparent.
   */
  finalColor?: string;
  /** How far will the shadow go. */
  distance: number;
  /** The style of the view that contains the shadow and the view containing the given children. */
  containerViewStyle?: StyleProp<ViewStyle>;
  /** The style of the view that contains the given children. */
  contentViewStyle?: StyleProp<ViewStyle>;
  /** The radius of each corner. Passing a number will apply it to all corners.
   *
   * If passing an object, undefined corners will have the radius of the `default` property if it's defined, else 0.
   *
   * @default 0
   * */
  radius?: number | {default?: number, topLeft?: number, topRight?: number, bottomLeft?: number, bottomRight?: number};
  /** The sides of your content (not including corners) that will have shadows rendered.
   *
   * Useful to not render a not visible shadow, improving the performance by a little bit.
   * @default ['left', 'right', 'top', 'bottom']
   * */
  sides?: Sides[];
  /** The corners of your content that will have shadows rendered.
   *
   * The sizings of the radius property will still be used on the side shadows sizes calculations.
   *
   * Useful to not render a not visible shadow, improving the performance by a little bit.
   * @default ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']
   */
  corners?: Corners[];
}
export const Shadow: React.FC<ShadowI> = ({
  size: sizeProp,
  radius = 0,
  sides: sidesProp = ['left', 'right', 'top', 'bottom'],
  corners: cornersProp = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'],
  containerViewStyle,
  contentViewStyle,
  startColor,
  finalColor = '#0000',
  distance,
  children,
}) => {

  if (finalColor === 'transparent')
    finalColor = '#0000';
  if (startColor === 'transparent')
    finalColor = '#0000';

  /** The calculated child layout. Only using width and height for now, looks x and y will be 0 unless maybe the contentViewStyle is changed. */
  const [childLayout, setChildLayout] = useState<LayoutRectangle | null>(null);


  // Does useMemo improve performance here?
  const shadow = useMemo(() => {

    if (!sizeProp && !childLayout)
      return null;

    // as Size as if not childLayout, sizeProp is truthy.
    const [contentWidth, contentHeight] = childLayout ? [childLayout.width, childLayout.height] : sizeProp as Size;
    const startColorOpacity = (parseToRgb(startColor) as RgbaColor).alpha ?? 1;
    const finalColorOpacity = (parseToRgb(finalColor) as RgbaColor).alpha ?? 1;


    const corners: Record<Corners, number> =
      typeof radius === 'number' ? {
        topLeft: radius,
        topRight: radius,
        bottomLeft: radius,
        bottomRight: radius
      } : {
        topLeft: Math.max(radius.topLeft ?? radius.default ?? 0, 0), // Min 0 to avoid undesired package behaviours.
        topRight: Math.max(radius.topRight ?? radius.default ?? 0, 0),
        bottomLeft: Math.max(radius.bottomLeft ?? radius.default ?? 0, 0),
        bottomRight: Math.max(radius.bottomRight ?? radius.default ?? 0, 0)
      };
    const { topLeft, topRight, bottomLeft, bottomRight } = corners;

    const cornersShadows: {
      topLeftShadow: number;
      topRightShadow: number;
      bottomLeftShadow: number;
      bottomRightShadow: number;
    } = {
      topLeftShadow: topLeft + distance,
      topRightShadow: topRight + distance,
      bottomLeftShadow: bottomLeft + distance,
      bottomRightShadow: bottomRight + distance
    };
    const { topLeftShadow, topRightShadow, bottomLeftShadow, bottomRightShadow } = cornersShadows;

    const activeSides: Record<Sides, boolean> = {
      left: sidesProp.includes('left'),
      right: sidesProp.includes('right'),
      top: sidesProp.includes('top'),
      bottom: sidesProp.includes('bottom'),
    };

    const activeCorners: Record<Corners, boolean> = {
      topLeft: cornersProp.includes('topLeft'),
      topRight: cornersProp.includes('topRight'),
      bottomLeft: cornersProp.includes('bottomLeft'),
      bottomRight: cornersProp.includes('bottomRight'),
    };

    /** The length of each side, without the respective corners sizes. 0 if won't render. */
    const sidesSize: Record<Sides, number> = {
      left: activeSides.left ? Math.max(contentHeight - topLeft - bottomLeft, 0) : 0,
      right: activeSides.right ? Math.max(contentHeight - topRight - bottomRight, 0) : 0,
      top: activeSides.top ? Math.max(contentWidth - topLeft - topRight, 0) : 0,
      bottom: activeSides.bottom ? Math.max(contentWidth - bottomLeft - bottomRight, 0) : 0,
    };
    const { left, right, top, bottom } = sidesSize;


    // Maybe set totalWidth to always contentWidth + distance * 2 and don't do this check below?
    const hasShadowOnLeft = activeSides.left || activeCorners.topLeft || activeCorners.bottomLeft;
    const hasShadowOnRight = activeSides.right || activeCorners.topRight || activeCorners.bottomRight;
    const hasShadowOnTop = activeSides.top || activeCorners.topLeft || activeCorners.topRight;
    const hasShadowOnBottom = activeSides.bottom || activeCorners.bottomLeft || activeCorners.bottomRight;

    // +!! https://stackoverflow.com/a/59694631/10247962
    const totalWidth = contentWidth + distance * ((+!!hasShadowOnLeft) + (+!!hasShadowOnRight));
    const totalHeight = contentHeight + distance * ((+!!hasShadowOnTop) + (+!!hasShadowOnBottom));


    // Fragment wasn't working for some reason, so, using array.
    const linearGradient = [
      // react-native-svg requires the alpha to be set in opacity prop to work.
      <Stop offset={1} stopColor={startColor} stopOpacity={startColorOpacity} key='1'/>,
      <Stop offset={0} stopColor={finalColor} stopOpacity={finalColorOpacity} key='2'/>
    ];

    function radialGradient(id: string, top: boolean, left: boolean, radius: number) {
      const shadowRadius = radius + distance;
      return (<RadialGradient
        id={id}
        cx={left ? shadowRadius : totalWidth - shadowRadius}
        cy={top ? shadowRadius : totalHeight - shadowRadius}
        r={shadowRadius}
        // fx and fy seems to be optional
        gradientUnits='userSpaceOnUse' // needed?
      >
        {/* First stop is a transparent circle, until the shadow itself. */}
        <Stop offset={radius / shadowRadius} stopColor={'#000'} stopOpacity={0} />
        <Stop offset={radius / shadowRadius} stopColor={startColor} stopOpacity={startColorOpacity}/>
        <Stop offset={1} stopColor={finalColor} stopOpacity={finalColorOpacity} />
      </RadialGradient>);
    }

    // console.log('childLayout: ', childLayout);
    // console.log('sides: ', sides);
    // console.log('corners: ', corners);
    // console.log('cornersShadows: ', cornersShadows);
    // console.log('\n');


    // viewBox saved me. Without it, paths wouldn't properly connect (sometimes there would be a gap between them),
    // clippings would happen, gap between the shadow and the content...
    // TODO [*1] for each corner get x1~3 and y1~3 for the connecting path points,
    // so there won't be mismatching values due to floating point calcs errors leading to tiny gaps.
    // The viewBox in svg fixed the previous gap, but I think it's still possible to happen due to this,
    // specially in paths that have calculations and relative positionings that will sum the errors.
    // If not ceiling, the shadow could/would get clipped. This don't change the expected result.
    // ^ looks like that using viewBox there is no longer the need of the Math.ceil.

    return (<Svg
      width={totalWidth}
      height={totalHeight}
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      style={{
        position: 'absolute',
        left: left ? -distance : 0, // passing them in Svg prop wouldn't do anything
        top: top ? -distance : 0,
      }}>
      <Defs>
        <LinearGradient id='left' x1='0' y1='0' x2='1' y2='0'>{linearGradient}</LinearGradient>
        <LinearGradient id='right' x1='1' y1='0' x2='0' y2='0'>{linearGradient}</LinearGradient>
        <LinearGradient id='top' x1='0' y1='0' x2='0' y2='1'>{linearGradient}</LinearGradient>
        <LinearGradient id='bottom' x1='0' y1='1' x2='0' y2='0'>{linearGradient}</LinearGradient>

        {radialGradient('top-left', true, true, topLeft)}
        {radialGradient('top-right', true, false, topRight)}
        {radialGradient('bottom-left', false, true, bottomLeft)}
        {radialGradient('bottom-right', false, false, bottomRight)}
      </Defs>

      {/* TODO Change Rects to paths? ([*1])*/}
      {activeSides.left && <Rect
        width={distance}
        height={left}
        y={top && topLeftShadow}
        fill='url(#left)'
      />}
      {activeSides.right && <Rect
        x={totalWidth - distance}
        width={distance}
        height={right}
        y={top && topRightShadow}
        fill='url(#right)'
      />}
      {activeSides.top && <Rect
        width={top}
        height={distance}
        x={left && topLeftShadow}
        fill='url(#top)'
      />}
      {activeSides.bottom && <Rect
        width={bottom}
        height={distance}
        x={left && bottomLeftShadow}
        y={totalHeight - distance}
        fill='url(#bottom)'
      />}

      {/* https://www.w3.org/TR/SVG/images/paths/arcs02.svg */}
      {/* Tried clipPath before but it would overlap by a tiny bit with the side shadows. */}
      {activeCorners.topLeft && <Path fill='url(#top-left)' d={`M 0 ${topLeftShadow}, a ${topLeftShadow} ${topLeftShadow} 0 0 1 ${topLeftShadow} ${-topLeftShadow}, v ${distance}, a ${topLeft} ${topLeft} 0 0 0 ${-topLeft} ${topLeft}, h ${distance}, z`}/> }
      {activeCorners.topRight && <Path fill='url(#top-right)' d={`M ${totalWidth - topRightShadow} 0, a ${topRightShadow} ${topRightShadow} 0 0 1 ${topRightShadow} ${topRightShadow}, h ${-distance}, a ${topRight} ${topRight} 0 0 0 ${-topRight} ${-topRight}, v ${-distance}, z`}/> }
      {activeCorners.bottomLeft && <Path fill='url(#bottom-left)' d={`M ${bottomLeftShadow} ${totalHeight}, a ${bottomLeftShadow} ${bottomLeftShadow} 0 0 1 ${-bottomLeftShadow} ${-bottomLeftShadow}, h ${distance}, a ${bottomLeft} ${bottomLeft} 0 0 0 ${bottomLeft} ${bottomLeft}, v ${distance}, z`}/> }
      {activeCorners.bottomRight && <Path fill='url(#bottom-right)' d={`M ${totalWidth} ${totalHeight - bottomRightShadow}, a ${bottomRightShadow} ${bottomRightShadow} 0 0 1 ${-bottomRightShadow} ${bottomRightShadow}, v ${-distance}, a ${bottomRight} ${bottomRight} 0 0 0 ${bottomRight} ${-bottomRight}, h ${distance}, z`}/> }

    </Svg>);
  }, [sizeProp, childLayout, startColor, finalColor, radius, distance, sidesProp, cornersProp]);

  return (
    <View style={containerViewStyle} onLayout={(e) => console.log(e.nativeEvent.layout)}>
      {/* Shadow before the content, so any shadow inner irregularities will be kept below it. */}
      {shadow}
      <View
        style={contentViewStyle}
        /** Only get child size if sizeProp wasn't given */
        {...(!sizeProp) && { onLayout: (e) => setChildLayout(e.nativeEvent.layout) } }
      >
        {children}
      </View>

      {/* Experimental: This below allows overflowing the children size.
        However, can't find a way to set the viewBox with this approach, so the gaps would probably happen.
        Would it sucessfuly use the style width and height as viewBox without gap?
        Maybe could use this on first render, then use the childLayout to set the viewBox sizing. The gaps would
        only happen on first render, but being it barely noticeable wouldn't be an issue. Better than no shadow on 1st render.
      */}
      {/* <Svg style={{ position: 'absolute', width: '110%', height: '100%', left: -10 }}>
        <Rect height={10} width={'100%'} fill={'#0f0'} y={'50%'}/>
      </Svg> */}
    </View>
  );
};
