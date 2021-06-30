// This code has a nice history! Check the previous commits to see how much it has changed!
// It got SMARTER!

import React, { useMemo } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Rect,
  Stop,
  Path,
  RadialGradient,
  Mask,
} from 'react-native-svg';
import { parseToRgb, rgbToColorString } from 'polished'; // To extract alpha
import type { RgbaColor } from 'polished/lib/types/color';



// Exclude<x, never>: https://github.com/microsoft/TypeScript/issues/42322#issuecomment-759786099
type Side = Exclude<'left' | 'right' | 'top' | 'bottom', never>;
type Corner = Exclude<'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', never>;
type CornerRadius = Record<Corner, number>
// Add Shadow to the corner names
type CornerRadiusShadow = {[K in keyof CornerRadius as `${K}Shadow`]: number}


export interface ShadowI {
  /** The color of the shadow when it's right next to the given content, leaving it.
   * Accepts alpha channel.
   *
   * @default '#00000020' */
  startColor?: string;
  /** The color of the shadow at the maximum distance from the content.
   * @default '#0000', transparent. */
  finalColor?: string;
  /** How far the shadow will go.
   * @default 10 */
  distance?: number;
  /** The style of the view that contains the shadow and the children.
   * @default undefined */
  containerViewStyle?: StyleProp<ViewStyle>;
  /** The radius of each corner of your child component. Passing a number will apply it to all corners.
   *
   * If passing an object, undefined corners will have the radius of the `default` property if it's defined.
   *
   * If undefined and if getChildRadius, it will attempt to get the child radius from the borderRadius style.
   *
   * Fallbacks to 0.
   * @default undefined */
  radius?: number | {default?: number, topLeft?: number, topRight?: number, bottomLeft?: number, bottomRight?: number};
  /** If it should try to get the radius from the child if `radius` prop is undefined. It will get the values for each
   * corner, like `borderTopLeftRadius`, and also `borderRadius`. If a specific corner isn't defined, `borderRadius` value is used.
   * If `borderRadius` isn't defined or < 0, 0 will be used.
   * @default true */
  getChildRadius?: boolean;
  /** The sides of your content that will have the shadows drawn. Doesn't include corners.
   *
   * @default ['left', 'right', 'top', 'bottom'] */
  sides?: Side[];
  /** The corners that will have the shadows drawn.
   *
   * @default ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] */
  corners?: Corner[];
  /** Moves the shadow. Negative x moves it to the left, negative y moves it up.
   *
   * Accepts 'x%' values, in relation to the child's size.
   *
   * Read paintInside property description for related configuration.
   * @default [0, 0] */
  offset?: [x: number | string, y: number | string];
  /** If the shadow should be applied inside the external shadows, below the child.
   *
   * You may want this as true when using offset or if your child have some transparency.
   * @default false */
  paintInside?: boolean;
}

export const Shadow: React.FC<ShadowI> = ({
  radius: radiusProp,
  sides: sidesProp = ['left', 'right', 'top', 'bottom'],
  corners: cornersProp = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'],
  containerViewStyle,
  startColor: startColorProp = '#00000030',
  finalColor: finalColorProp = '#0000',
  distance: distanceProp = 10,
  children,
  offset = [0, 0],
  getChildRadius: getChildRadiusProp = true,
  paintInside = false,
}) => {

  const [offsetX, offsetY] = offset;
  const distance = Math.max(distanceProp, 0); // Min val as 0


  // Does useMemo improve performance here?
  const shadow = useMemo(() => {

    const startColor = startColorProp === 'transparent' ? '#0000' : startColorProp;
    const finalColor = finalColorProp === 'transparent' ? '#0000' : finalColorProp;

    const startColorRgb = parseToRgb(startColor) as Omit<RgbaColor, 'alpha'> & {alpha?: number};
    const finalColorRgb = parseToRgb(finalColor) as Omit<RgbaColor, 'alpha'> & {alpha?: number};

    // [*1] Seems that SVG in web accepts opacity in hex color, but in mobile doesn't.
    // So we remove the opacity from the color, and only apply the opacity in stopOpacity, so in web
    // it isn't applied twice.
    const startColorWoOpacity = rgbToColorString({ ...startColorRgb, alpha: undefined });
    const finalColorWoOpacity = rgbToColorString({ ...finalColorRgb, alpha: undefined });

    const startColorOpacity = startColorRgb.alpha ?? 1;
    const finalColorOpacity = finalColorRgb.alpha ?? 1;


    const doGetChildRadius = getChildRadiusProp && radiusProp === undefined;

    if (doGetChildRadius && React.Children.count(children) > 1)
      throw new Error('Only single child is accepted in Shadow component with getChildRadius={true} (default). You should wrap it in a View or change this property to false and manually enter the borderRadius in the radius property.');

    const childStyle = doGetChildRadius
      ? (React.Children.only(children) as any | undefined)?.props?.style as ViewStyle | undefined
      : undefined;

    const cornerRadius: CornerRadius = doGetChildRadius
      ? {
        topLeft: Math.max(childStyle?.borderTopLeftRadius ?? childStyle?.borderRadius ?? 0, 0),
        topRight: Math.max(childStyle?.borderTopRightRadius ?? childStyle?.borderRadius ?? 0, 0),
        bottomLeft: Math.max(childStyle?.borderBottomLeftRadius ?? childStyle?.borderRadius ?? 0, 0),
        bottomRight: Math.max(childStyle?.borderBottomRightRadius ?? childStyle?.borderRadius ?? 0, 0),
      } : (typeof radiusProp === 'number' ? {
        topLeft: Math.max(radiusProp, 0),
        topRight: Math.max(radiusProp, 0),
        bottomLeft: Math.max(radiusProp, 0), // Min val 0 to avoid undesired behaviours.
        bottomRight: Math.max(radiusProp, 0),
      } : {
        topLeft: Math.max(radiusProp?.topLeft ?? radiusProp?.default ?? 0, 0),
        topRight: Math.max(radiusProp?.topRight ?? radiusProp?.default ?? 0, 0),
        bottomLeft: Math.max(radiusProp?.bottomLeft ?? radiusProp?.default ?? 0, 0),
        bottomRight: Math.max(radiusProp?.bottomRight ?? radiusProp?.default ?? 0, 0),
      });
    const { topLeft, topRight, bottomLeft, bottomRight } = cornerRadius; // So we can print cornerRadius for debug.

    const cornerShadowRadius: CornerRadiusShadow = {
      topLeftShadow: topLeft + distance,
      topRightShadow: topRight + distance,
      bottomLeftShadow: bottomLeft + distance,
      bottomRightShadow: bottomRight + distance,
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
      // In web, lesser offsets needs to come before.
      <Stop offset={0} stopColor={startColorWoOpacity} stopOpacity={startColorOpacity} key='1'/>,
      <Stop offset={1} stopColor={finalColorWoOpacity} stopOpacity={finalColorOpacity} key='2'/>,
    ];

    function radialGradient(id: string, top: boolean, left: boolean, radius: number, shadowRadius: number) {
      return (<RadialGradient
        id={id}
        cx={left ? '100%' : 0} // fx and fy seems to be optional
        cy={top ? '100%' : 0}
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

      {/* We do another awesome hack here with the side position and masking the total length of the corners. Else,
        we would need to apply the other part of the mask with a specific position, but we don't know it. 🤯 */}
      {activeSides.left && <Svg style={{ position: 'absolute', right: '100%', bottom: bottomLeft }} width={distance} height={'100%'}>
        <Defs>
          <Mask id='leftMask'>
            <Rect height='100%' width='100%' fill='#fff'/>
            {/* v Single mask rect for both ends! v */}
            <Rect height={topLeft + bottomLeft} width='100%' fill='#000'/>
          </Mask>
          <LinearGradient id='left' x1='1' y1='0' x2='0' y2='0'>{linearGradient}</LinearGradient>
        </Defs>
        <Rect width='100%' height='100%' fill='url(#left)' mask='url(#leftMask)'/>
      </Svg>}

      {activeSides.right && <Svg style={{ position: 'absolute', left: '100%', bottom: bottomRight }} width={distance} height={'100%'}>
        <Defs>
          <Mask id='rightMask'>
            <Rect height='100%' width='100%' fill='#fff'/>
            <Rect height={topRight + bottomRight} width='100%' fill={'#000'}/>
          </Mask>
          <LinearGradient id='right' x1='0' y1='0' x2='1' y2='0'>{linearGradient}</LinearGradient>
        </Defs>
        <Rect width='100%' height='100%' fill='url(#right)' mask='url(#rightMask)'/>
      </Svg>}

      {activeSides.bottom && <Svg style={{ position: 'absolute', top: '100%', right: bottomRight }} width={'100%'} height={distance}>
        <Defs>
          <Mask id='bottomMask'>
            <Rect height='100%' width='100%' fill='#fff'/>
            <Rect height='100%' width={bottomLeft + bottomRight} fill='#000'/>
          </Mask>
          <LinearGradient id='bottom' x1='0' y1='0' x2='0' y2='1'>{linearGradient}</LinearGradient>
        </Defs>
        <Rect width='100%' height='100%' fill='url(#bottom)' mask='url(#bottomMask)'/>
      </Svg>}

      {activeSides.top && <Svg style={{ position: 'absolute', bottom: '100%' }} width={'100%'} height={distance}>
        <Defs>
          <Mask id='topMask'>
            <Rect height='100%' width='100%' fill='#fff'/>
            <Rect height='100%' width={topLeft} fill='#000'/>
            <Rect height='100%' width={topRight} x='100%' transform={`translate(${-topRight}, 0)`} fill='#000'/>
          </Mask>
          <LinearGradient id='top' x1='0' y1='1' x2='0' y2='0'>{linearGradient}</LinearGradient>
        </Defs>
        <Rect width='100%' height='100%' fill='url(#top)' mask='url(#topMask)'/>
      </Svg>}


      {/* Corners */}

      {/* The anchor for the svgs is the top left point in the corner square.
        The starting point is the clockwise external arc init point. */}

      {activeCorners.topLeft && <Svg width={topLeftShadow} height={topLeftShadow}
        style={{ position: 'absolute', top:-distance, left: -distance }}
      >
        <Defs>{radialGradient('topLeft', true, true, topLeft, topLeftShadow)}</Defs>
        <Path fill='url(#topLeft)' d={`M0,${topLeftShadow} a${topLeftShadow},${topLeftShadow} 0 0 1 ${topLeftShadow} ${-topLeftShadow} v${distance} ${paintInside
          ? `v${topLeft} h${-topLeft}` // read [*2] below for the explanation for this
          : `a${topLeft},${topLeft} 0 0 0 ${-topLeft},${topLeft}`
        } h${-distance} Z`}/>
      </Svg>}

      {activeCorners.topRight && <Svg width={topRightShadow} height={topRightShadow}
        style={{ position: 'absolute', top: -distance, right: -distance }}
      >
        <Defs>{radialGradient('topRight', true, false, topRight, topRightShadow)}</Defs>
        <Path fill='url(#topRight)' d={`M0,0 a${topRightShadow},${topRightShadow} 0 0 1 ${topRightShadow},${topRightShadow} h${-distance} ${paintInside
          ? `h${-topRight} v${-topLeft}`
          : `a${topRight},${topRight} 0 0 0 ${-topRight},${-topRight}`
        } v${-distance} Z`}/>
      </Svg>}

      {activeCorners.bottomLeft && <Svg width={bottomLeftShadow} height={bottomLeftShadow}
        style={{ position: 'absolute', bottom: -distance, left: -distance }}
      >
        <Defs>{radialGradient('bottomLeft', false, true, bottomLeft, bottomLeftShadow)}</Defs>
        <Path fill='url(#bottomLeft)' d={`M${bottomLeftShadow},${bottomLeftShadow} a${bottomLeftShadow},${bottomLeftShadow} 0 0 1 ${-bottomLeftShadow},${-bottomLeftShadow} h${distance} ${paintInside
          ? `h${bottomLeft} v${bottomLeft}`
          : `a${bottomLeft},${bottomLeft} 0 0 0 ${bottomLeft},${bottomLeft}`
        } v${distance} Z`}/>
      </Svg>}

      {activeCorners.bottomRight && <Svg width={bottomRightShadow} height={bottomRightShadow}
        style={{ position: 'absolute', bottom: -distance, right: -distance }}
      >
        <Defs>{radialGradient('bottomRight', false, false, bottomRight, bottomRightShadow)}</Defs>
        <Path fill='url(#bottomRight)' d={`M${bottomRightShadow},0 a${bottomRightShadow},${bottomRightShadow} 0 0 1 ${-bottomRightShadow},${bottomRightShadow} v${-distance} ${paintInside
          ? `v${-bottomRight} h${bottomRight}`
          : `a${bottomRight},${bottomRight} 0 0 0 ${bottomRight},${-bottomRight}`
        } h${distance} Z`}/>
      </Svg>}


      {/* Paint the inner area, so we can offset it.
        [*2] I tried redrawing the inner corner arc, but there would always be a small gap between the external shadows
        and this internal shadow along the curve. So, instead we dont specify the inner arc on the corners when
        paintBelow, but just use a square inner corner. And here we will just mask those squares in each corner. */}
      {paintInside && <Svg width='100%' height='100%'
        style={{ position: 'absolute' }}
      >
        <Defs>
          <Mask id='maskPaintBelow'>
            {/* Paint all white, then black on border external areas to erase them */}
            <Rect width='100%' height='100%' fill='#fff'/>
            {/* Remove the corners squares */}
            <Rect width={topLeft} height={topLeft} fill='#000'/>
            <Rect width={topRight} height={topRight} x='100%' transform={`translate(${-topRight}, 0)`} fill='#000'/>
            <Rect width={bottomLeft} height={bottomLeft} y='100%' transform={`translate(0, ${-bottomLeft})`} fill='#000'/>
            <Rect width={bottomRight} height={bottomRight} x='100%' y='100%' transform={`translate(${-bottomRight}, ${-bottomRight})`}fill='#000'/>
          </Mask>
        </Defs>
        <Rect width='100%' height='100%' mask='url(#maskPaintBelow)' fill={startColorWoOpacity} fillOpacity={startColorOpacity}/>
      </Svg>}

    </>);
  }, [startColorProp, finalColorProp, getChildRadiusProp, radiusProp, children, distance, sidesProp, cornersProp, paintInside]);

  return (

    <View style={containerViewStyle}>
      {/* // Without this alignSelf that I found by somewhat randomly trying, the shadow could have wrong size
       if it had siblings. eg: https://imgur.com/a/SjdLCJz the text in here was outside the Shadow component,
       and the shadow by some reason would have corresponding sizing. I show there without and with the alignSelf.
      */}
      <View style={[{ alignSelf: 'center' }]}>
        {/* Shadow below the children */}
        <View style={{ width: '100%', height: '100%', position: 'absolute', left: offsetX, top: offsetY }}>
          {shadow}
        </View>
        {children}
      </View>
    </View>
  );
};