// Sandbox to test the library. I tried using the symlink npx workaround but it's somewhat bugged.
// Using a copy of the lib code here.
import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch, TextInput, Pressable } from 'react-native';
import { Shadow } from './index';
import Slider from '@react-native-community/slider';
import tinycolor from 'tinycolor2';
import { PageScrollView } from 'pagescrollview';



// ScreenOrientation.unlockAsync();

export const App3: React.FC = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Shadow>
        <View>
          <Text style={{ margin: 20, fontSize: 20 }}>{'🙂'}</Text>
        </View>
      </Shadow>
    </View>
  );
};

// export const App: React.FC = () => {
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Svg >

//       </Svg>
//     </View>
//   );
// };

export const App4: React.FC = () => {
  return (
    // gap with width=209.733 and/or height 100.733. https://github.com/react-native-svg/react-native-svg/issues/1613
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

      <Shadow distance={15} startColor={'#ac4718a0'} finalColor={'#f0f2'} offset={[3, 5]} >
        <View style={{ borderTopLeftRadius: 24, borderBottomRightRadius: 0, borderRadius: 1, backgroundColor: 'white' }}>
          <Text style={{ margin: 20, fontSize: 20 }}>{'😮'}</Text>
        </View>
      </Shadow>

    </View>
  );
};


const NameValue: React.FC<{
  name: string, value: string | number | boolean, valueMonospace?: boolean
}> = ({ name, value, valueMonospace = false }) => {
  return (
    <View style={{
      alignSelf: 'stretch',
      flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2,
    }}>
      <Text style={{ fontSize: 16 }}>{name}</Text>
      <Text style={{ fontSize: 16, fontWeight: 'bold', fontFamily: valueMonospace ? 'monospace' : undefined }}>{String(value)}</Text>
    </View>);
};


const SliderWithIncDec: React.FC<{
  name: string;
  step?: number;
  minimumValue: number;
  maximumValue: number;
  value: number
  onValueChange: (value: number) => void
}> = ({ name, step = 1, minimumValue, maximumValue, value, onValueChange }) => {
  return (
    <View style={{ marginBottom: 18 }}>
      <NameValue {...{ name, value }} />
      <View style={{ flexDirection: 'row' }}>
        <Pressable onPress={() => onValueChange(value - step)} style={({ pressed }) => [styles.decIncButton, pressed && { backgroundColor: '#bbb' }]}>
          <Text selectable={false} style={{ fontSize: 16, fontWeight: 'bold' }}>{'-'}</Text>
        </Pressable>
        <Slider style={{ width: 140, marginHorizontal: 20 }}
          {...{ step, minimumValue, maximumValue, value, onValueChange }}
        />
        <Pressable onPress={() => onValueChange(value + step)} style={({ pressed }) => [styles.decIncButton, pressed && { backgroundColor: '#bbb' }]}>
          <Text selectable={false} style={{ fontSize: 16, fontWeight: 'bold' }}>{'+'}</Text>
        </Pressable>
      </View>
    </View>
  );
};



const defaults = {
  startColor: tinycolor('#00000020').toHex8String(),
  finalColor: tinycolor('#000f').toHex8String(),
  childColor: tinycolor('#fff').toHex8String(),
};

export const App: React.FC = () => {
  const [distance, setDistance] = useState(50);
  const [borderRadius, setBorderRadius] = useState(30);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [paintInside, setPaintInside] = useState(false);
  const [getChildRadius, setGetChildRadius] = useState(true);

  const [childWidth, setChildWidth] = useState(200);
  const [childHeight, setChildHeight] = useState(200);

  const [startColor, setStartColor] = useState(defaults.startColor);
  const [finalColor, setFinalColor] = useState(defaults.finalColor);
  const [childColor, setChildColor] = useState(defaults.childColor);

  return (
    <PageScrollView viewStyle={styles.container}>

      <Text style={styles.title}>{`react-native-shadow-2 sandbox`}</Text>
      <Text style={styles.subtitle}>{`By SrBrahma @ https://github.com/SrBrahma/react-native-shadow-2`}</Text>

      <View style={styles.sandbox}>
        <View style={styles.settings}>

          <SliderWithIncDec
            name='Child Width'
            step={0.1}
            minimumValue={0} maximumValue={200}
            value={childWidth} onValueChange={setChildWidth}
          />

          <SliderWithIncDec
            name='Child Height'
            step={0.1}
            minimumValue={0} maximumValue={200}
            value={childHeight} onValueChange={setChildHeight}
          />

          <SliderWithIncDec
            name='Distance'
            minimumValue={-10} maximumValue={100} // min -10 to show < 0 won't do anything
            value={distance} onValueChange={setDistance}
          />

          <SliderWithIncDec
            name='Border Radius'
            minimumValue={-10} maximumValue={100} // min -10 to show < 0 won't do anything
            value={borderRadius} onValueChange={setBorderRadius}
          />

          <SliderWithIncDec
            name='Offset X'
            minimumValue={-20} maximumValue={20}
            value={offsetX} onValueChange={setOffsetX}
          />

          <SliderWithIncDec
            name='Offset Y'
            minimumValue={-20} maximumValue={20}
            value={offsetY} onValueChange={setOffsetY}
          />


          {/* <Text style={{ marginBottom: 3 }}>{`getChildRadius: ${getChildRadius}`}</Text>
          <Text style={{}}>{'False will also set radius={borderRadius}.'}</Text>
          <Text style={{ marginBottom: 2 }}>{`Won't change the result here, it's just for testing.`}</Text>
          <Switch value={getChildRadius} onValueChange={setGetChildRadius} style={styles.switch}/> */}

          <NameValue name='Start Color' value={startColor} valueMonospace/>
          <TextInput style={styles.textInput} defaultValue={defaults.startColor} autoCorrect={false} onChangeText={(text) => {
            const color = tinycolor(text);
            if (color.isValid()) // Only change if valid input
              setStartColor(color.toHex8String());
          }}/>

          <NameValue name='Final Color' value={finalColor} valueMonospace/>
          <TextInput style={styles.textInput} defaultValue={defaults.finalColor} autoCorrect={false} onChangeText={(text) => {
            const color = tinycolor(text);
            if (color.isValid())
              setFinalColor(color.toHex8String());
          }}/>

          <NameValue name='Child Color' value={childColor} valueMonospace/>
          <TextInput style={styles.textInput} defaultValue={defaults.childColor} autoCorrect={false} onChangeText={(text) => {
            const color = tinycolor(text);
            if (color.isValid())
              setChildColor(color.toHex8String());
          }}/>

          <NameValue name='Paint Inside' value={paintInside}/>
          <Switch value={paintInside} onValueChange={setPaintInside} style={styles.switch} />

        </View>

        <View style={{ flexDirection: 'column' }}>
          <Shadow
            distance={distance}
            startColor={startColor}
            finalColor={finalColor}
            offset={[offsetX, offsetY]}
            paintInside={paintInside}
            getChildRadiusStyle={getChildRadius}
            radius={getChildRadius ? undefined : borderRadius}
            containerViewStyle={{ margin: 100 }}
          >
            {/* FIXME With size 200.4 there is a gap in web and overlap in mobile. */}
            <View style={{ width: childWidth, height: childHeight, backgroundColor: childColor,
            // If borderRadius change from a positive value to a negative one, it won't change the current radius.
            // This is here just to avoid the slider causing it to happen, for fast movements. You can disable this line
            // to see what I mean. Nothing to worry about in prod envs.
              borderRadius: Math.max(borderRadius, 0),
            }}/>
          </Shadow>
          <Text>{'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'}</Text>
        </View>

      </View>

    </PageScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    backgroundColor: '#ececec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 30,
    marginBottom: 20,
  },
  subtitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#444',
  },
  sandbox: {
    marginTop: 40,
    flexWrap: 'wrap-reverse', // to make it responsive, with the shadow component being above the settings
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settings: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 4,
    marginBottom: 18,
  },
  switch: {
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: '#fff',
    borderColor: '#222',
    borderRadius: 3,
    paddingVertical: 3,
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingHorizontal: 8,
    fontSize: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  decIncButton: {
    backgroundColor: '#fff',
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
});