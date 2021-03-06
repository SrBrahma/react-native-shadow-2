// First I tried to use react-native-linear & radial-gradient (that uses react-native-svg),
// but they would, depending on device and view dimensions and positions, have a pixel between their views.
// So I decided to try using the svg directly.

import React, { useMemo, useState } from 'react';
import { Dimensions, LayoutRectangle, StyleProp, View, ViewStyle } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Rect,
  Stop,
  RadialGradient,
  Path,
  Symbol,
  Use,
} from 'react-native-svg';
import { parseToRgb } from 'polished'; // To extract alpha
import type { RgbaColor } from 'polished/lib/types/color';



type Size = [width: number, height: number];

// Exclude<x, never>: https://github.com/microsoft/TypeScript/issues/42322#issuecomment-759786099
type Sides = Exclude<'left' | 'right' | 'top' | 'bottom', never>;
type Corners = Exclude<'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', never>;



// "Pixel perfect" solution:
// RN seems to use .round. Inputting 30 height on a view, onLayout would output ~29.81h. 29.7 would also output that same value.
function R(value: number) {
  const scale = Dimensions.get('screen').scale; // always getting as scale may change on the run?
  return Math.round(value * scale) / scale;
}


interface ShadowI {
  /** The width and height of your content, not including the shadow.
   *
   * If not defining it, the shadow will take 1 render to get the content size then render the shadow.
   *
   * ^ In the future there will be a callback that will be called when it's done. It takes milliseconds,
   * but may be perceptible.
   */
  size?: Size;
  /** The color of the shadow when it's right next to the given content, leaving it.
   * Accepts alpha channel.
   * @default '#00000010'
  */
  startColor?: string;
  /** The color of the shadow at the maximum distance from the content.
   * @default '#0000', transparent.
   */
  finalColor?: string;
  /** How far will the shadow go.
   * @default 10 */
  distance?: number;
  /** The style of the view that contains the shadow and the view containing the given children. */
  containerViewStyle?: StyleProp<ViewStyle>;
  /** The style of the view that contains the given children. */
  contentViewStyle?: StyleProp<ViewStyle>;
  /** The radius of each corner. Passing a number will apply it to all corners.
   *
   * If passing an object, undefined corners will have the radius of the `default` property if it's defined, else 0.
   *
   * @default 0 */
  radius?: number | {default?: number, topLeft?: number, topRight?: number, bottomLeft?: number, bottomRight?: number};
  /** The sides of your content (not including corners) that will have shadows rendered.
   *
   * Useful to not render a not visible shadow, improving the performance by a little bit.
   * @default ['left', 'right', 'top', 'bottom'] */
  sides?: Sides[];
  /** The corners of your content that will have shadows rendered.
   *
   * The sizings of the radius property will still be used on the side shadows sizes calculations.
   *
   * Useful to not render a not visible shadow, improving the performance by a little bit.
   * @default ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] */
  corners?: Corners[];
  /** Moves the shadow. Negative x moves it to the left, negative y moves it up.
   *
   * */
  offset?: [x: number, y: number];
}
export const Shadow: React.FC<ShadowI> = ({
  size: sizeProp,
  radius = 0,
  sides: sidesProp = ['left', 'right', 'top', 'bottom'],
  corners: cornersProp = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'],
  containerViewStyle,
  contentViewStyle,
  startColor: startColorProp = '#00000010',
  finalColor: finalColorProp = '#0000',
  distance: distanceProp = 10,
  children,
  offset,
}) => {

  /** The calculated child layout. Only using width and height for now, looks x and y will be 0 unless maybe the contentViewStyle is changed. */
  const [childLayout, setChildLayout] = useState<LayoutRectangle | null>(null);


  // Does useMemo improve performance here?
  const shadow = useMemo(() => {

    const startColor = startColorProp === 'transparent' ? '#0000' : startColorProp;
    const finalColor = finalColorProp === 'transparent' ? '#0000' : finalColorProp;

    // Fixes the tiny blank space between the content and the shadow.
    const distance = R(distanceProp);
    const [offsetX, offsetY] = offset ?? [0, 0];

    if (!sizeProp && !childLayout)
      return null;

    // as Size as if not childLayout, sizeProp is truthy.
    const [contentWidth, contentHeight] = childLayout ? [childLayout.width, childLayout.height] : sizeProp as Size;
    const startColorOpacity = (parseToRgb(startColor) as RgbaColor).alpha ?? 1;
    const finalColorOpacity = (parseToRgb(finalColor) as RgbaColor).alpha ?? 1;


    const cornerRadius: Record<Corners, number> =
      typeof radius === 'number' ? {
        topLeft: radius,
        topRight: radius,
        bottomLeft: radius,
        bottomRight: radius
      } : {
        topLeft: Math.max(radius.topLeft ?? radius.default ?? 0, 0), // Min val 0 to avoid undesired behaviours.
        topRight: Math.max(radius.topRight ?? radius.default ?? 0, 0),
        bottomLeft: Math.max(radius.bottomLeft ?? radius.default ?? 0, 0),
        bottomRight: Math.max(radius.bottomRight ?? radius.default ?? 0, 0)
      };
    const { topLeft, topRight, bottomLeft, bottomRight } = cornerRadius;

    const cornerShadowRadius: {
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
    const { topLeftShadow, topRightShadow, bottomLeftShadow, bottomRightShadow } = cornerShadowRadius;

    /** Which sides will have shadow. */
    const activeSides: Record<Sides, boolean> = {
      left: sidesProp.includes('left'),
      right: sidesProp.includes('right'),
      top: sidesProp.includes('top'),
      bottom: sidesProp.includes('bottom'),
    };

    /** Which corners will have shadow. */
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


    // +!! https://stackoverflow.com/a/59694631/10247962
    // was using conditional size, depending on the sides with shadow, but removed it
    const totalWidth = contentWidth + distance * 2;
    const totalHeight = contentHeight + distance * 2;

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
        cx={left ? shadowRadius : totalWidth - shadowRadius} // fx and fy seems to be optional
        cy={top ? shadowRadius : totalHeight - shadowRadius}
        r={shadowRadius}
        gradientUnits='userSpaceOnUse' // won't show if this isn't set
      >
        <Stop offset={radius / shadowRadius} stopColor={startColor} stopOpacity={startColorOpacity}/>
        <Stop offset={1} stopColor={finalColor} stopOpacity={finalColorOpacity} />
      </RadialGradient>);
    }

    // console.log('totalW/H: ', totalWidth, totalHeight);
    // console.log('childLayout: ', childLayout);
    // console.log('sidesSize: ', sidesSize);
    // console.log('corners: ', cornerRadius);
    // console.log('cornersShadows: ', cornerShadowRadius);
    // console.log('\n');

    // viewBox saved me. Without it, paths wouldn't properly connect (sometimes there would be a gap between them),
    // clippings would happen, gap between the shadow and the content...
    // TODO [*1] for each corner get x1~3 and y1~3 for the connecting path points,
    // so there won't be mismatching values due to floating point calcs errors leading to tiny gaps.
    // The viewBox in svg fixed the previous gap, but I think it's still possible to happen due to this,
    // specially in paths that have calculations and relative positionings that will sum the errors.
    // If not ceiling, the shadow could/would get clipped. This don't change the expected result.
    // ^ looks like that using viewBox there is no longer the need of the Math.ceil.
    // ^ wrong. had a case of when using just a shadow size, it wouldn't take all side length. Ceil fixed it.
    // ^ but, it would cause full shadow having gaps between content and the shadow itself.
    // ^ working without viewbox. what was the problem case? = R(distance).

    // const bottomRightLeftX = totalWidth - bottomRightShadow;

    return (
      <Svg
        // onLayout={(e) => console.log('svgLayout: ', e.nativeEvent.layout)}
        width={totalWidth}
        height={totalHeight}
        // viewBox={`0 0 ${totalWidth} ${totalHeight}`} // doesn't seem fix anything more

        style={{
          position: 'absolute',
          left: - distance + offsetX,
          top: - distance + offsetY,
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

          {/* Content shape, to use with offset */}
          {offset && <Symbol id='content' viewBox={`0 0 ${contentWidth} ${contentHeight}`}>
            <Path d={`M ${topLeft} 0, h ${sidesSize.top}, a ${topRight} ${topRight} 0 0 1 ${topRight} ${topRight}, v ${sidesSize.right}, a ${bottomRight} ${bottomRight} 0 0 1 ${-bottomRight} ${bottomRight}, h ${-sidesSize.bottom}, a ${bottomLeft} ${bottomLeft} 0 0 1 ${-bottomLeft} ${-bottomLeft}, v ${-sidesSize.left}, a ${topLeft} ${topLeft} 0 0 1 ${topLeft} ${-topLeft}, Z`}/>
          </Symbol>}

          {/* <Mask // trying to do mask content bg offset
            id='mask'
            width={contentWidth}
            height={contentHeight}

            x={0} y={0}
          >
            <Use href='#content' x={distance} y={distance} width={contentWidth} height={contentHeight} fill={'url(#left)'}/>
          </Mask> */}
        </Defs>



        {offset && <Use id='offsetContentBack' href='#content' x={distance} y={distance} width={contentWidth} height={contentHeight} fill={startColor}/>}
        {/* TODO Change Rects to paths? ([*1]) */}
        {activeSides.left &&
          <Rect x={0} y={sidesSize.top && topLeftShadow} width={distance} height={sidesSize.left} fill='url(#left)'/>}
        {activeSides.right &&
          <Rect x={totalWidth - distance} y={sidesSize.top && topRightShadow} width={distance} height={sidesSize.right} fill='url(#right)'/>}
        {activeSides.top &&
          <Rect x={sidesSize.left && topLeftShadow} y={0} width={sidesSize.top} height={distance} fill='url(#top)'/>}
        {activeSides.bottom &&
          <Rect x={sidesSize.left && bottomLeftShadow} y={totalHeight - distance} width={sidesSize.bottom} height={distance} fill='url(#bottom)'/>}

        {/* https://www.w3.org/TR/SVG/images/paths/arcs02.svg */}
        {/* Tried clipPath before but it would overlap by a tiny bit with the side shadows. */}
        {/* using path instead of rect wont help in the 'just side shadow not taking all side length */}
        {/* {activeSides.left && <Path fill='url(#left)' d={`M 0 0, h ${distance}, V ${sidesSize.left}, h ${-distance}, V ${sidesSize.left}, Z`}/>} */}
        {activeCorners.topLeft && <Path fill='url(#top-left)' d={`M 0 ${topLeftShadow}, a ${topLeftShadow} ${topLeftShadow} 0 0 1 ${topLeftShadow} ${-topLeftShadow}, v ${distance}, a ${topLeft} ${topLeft} 0 0 0 ${-topLeft} ${topLeft}, h ${distance}, z`}/> }
        {activeCorners.topRight && <Path fill='url(#top-right)' d={`M ${totalWidth - topRightShadow} 0, a ${topRightShadow} ${topRightShadow} 0 0 1 ${topRightShadow} ${topRightShadow}, h ${-distance}, a ${topRight} ${topRight} 0 0 0 ${-topRight} ${-topRight}, v ${-distance}, z`}/> }
        {activeCorners.bottomLeft && <Path fill='url(#bottom-left)' d={`M ${bottomLeftShadow} ${totalHeight}, a ${bottomLeftShadow} ${bottomLeftShadow} 0 0 1 ${-bottomLeftShadow} ${-bottomLeftShadow}, h ${distance}, a ${bottomLeft} ${bottomLeft} 0 0 0 ${bottomLeft} ${bottomLeft}, v ${distance}, z`}/> }
        {activeCorners.bottomRight && <Path fill='url(#bottom-right)' d={`M ${totalWidth} ${totalHeight - bottomRightShadow}, a ${bottomRightShadow} ${bottomRightShadow} 0 0 1 ${-bottomRightShadow} ${bottomRightShadow}, v ${-distance}, a ${bottomRight} ${bottomRight} 0 0 0 ${bottomRight} ${-bottomRight}, h ${distance}, z`}/> }

        {/* TODO: remove shadow below content when using offset. */}
        {/* <Use href='#content' x={distance-offsetX} y={distance-offsetY} width={contentWidth} height={contentHeight} mask='url(#mask)'/> */}
      </Svg>
    );
  }, [sizeProp, childLayout, startColorProp, finalColorProp, radius, distanceProp, sidesProp, cornersProp, offset]);

  return (
    <View style={containerViewStyle}>
      {/* Shadow before the content, so any shadow inner irregularities will be kept below it. */}
      {shadow}
      {/* <View style={{ backgroundColor: 'pink', height: 29.81818199157715, width: 30 }}/> */}
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
