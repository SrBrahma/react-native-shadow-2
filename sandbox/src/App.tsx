// Quick code to manually test the package.

import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch, ScrollView } from 'react-native';
import { Shadow } from './index';
import Slider from '@react-native-community/slider';
import { TextInput } from 'react-native';
import tinycolor from 'tinycolor2';


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

export const App2: React.FC = () => {
  return (
    // gap with width=209.733 and/or height 100.733. https://github.com/react-native-svg/react-native-svg/issues/1613
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

      <Shadow distance={15} startColor={'#ac4718a0'} finalColor={'#f0f2'} offset={[3, 5]} paintInside>
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
    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
      <Text style={{}}>{name}</Text>
      <Text style={{
        fontWeight: '600', color: '#222', fontFamily: valueMonospace ? 'monospace' : undefined,
      }}>{String(value)}</Text>
    </View>);
};

const defaults = {
  startColor: tinycolor('#00000020').toHex8String(),
  finalColor: tinycolor('#0000').toHex8String(),
  childColor: tinycolor('#fff').toHex8String(),
};

export const App: React.FC = () => {
  const [distance, setDistance] = useState(50);
  const [borderRadius, setBorderRadius] = useState(30);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [paintInside, setPaintInside] = useState(false);
  const [getChildRadius, setGetChildRadius] = useState(true);

  const [startColor, setStartColor] = useState(defaults.startColor);
  const [finalColor, setFinalColor] = useState(defaults.finalColor);
  const [childColor, setChildColor] = useState(defaults.childColor);

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>{`react-native-shadow-2 sandbox`}</Text>
      <Text style={styles.subtitle}>{`By SrBrahma @ https://github.com/SrBrahma/react-native-shadow-2`}</Text>

      <View style={styles.sandbox}>
        <View style={styles.settings}>
          <NameValue name='Distance' value={distance}/>
          <Slider style={styles.slider} step={1}
            minimumValue={-10} maximumValue={100} // min -10 to show < 0 won't do anything
            value={distance}  onValueChange={setDistance}
          />
          <NameValue name='Border Radius' value={borderRadius}/>
          <Slider style={styles.slider} step={1}
            minimumValue={-10} maximumValue={100} // min -10 to show < 0 won't do anything
            value={borderRadius} onValueChange={setBorderRadius}
          />
          <NameValue name='Offset X' value={offsetX}/>
          <Slider style={styles.slider} step={1}
            minimumValue={-20} maximumValue={20} // min -10 to show < 0 won't do anything
            value={offsetX} onValueChange={setOffsetX}
          />
          <NameValue name='Offset Y' value={offsetY}/>
          <Slider style={styles.slider} step={1}
            minimumValue={-20} maximumValue={20} // min -10 to show < 0 won't do anything
            value={offsetY} onValueChange={setOffsetY}
          />

          {/* <Text style={{ marginBottom: 3 }}>{`getChildRadius: ${getChildRadius}`}</Text>
          <Text style={{}}>{'False will also set radius={borderRadius}.'}</Text>
          <Text style={{ marginBottom: 2 }}>{`Won't change the result here, it's just for testing.`}</Text>
          <Switch value={getChildRadius} onValueChange={setGetChildRadius} style={styles.switch}/> */}

          <NameValue name='Start Color' value={startColor} valueMonospace/>
          <TextInput style={styles.textInput} defaultValue={startColor} onChangeText={(text) => {
            const color = tinycolor(text);
            if (color.isValid()) // Only change if valid input
              setStartColor(color.toHex8String());
          }}/>

          <NameValue name='Final Color' value={finalColor} valueMonospace/>
          <TextInput style={styles.textInput} defaultValue={finalColor} onChangeText={(text) => {
            const color = tinycolor(text);
            if (color.isValid())
              setFinalColor(color.toHex8String());
          }}/>

          <NameValue name='Child Color' value={childColor} valueMonospace/>
          <TextInput style={styles.textInput} defaultValue={childColor} onChangeText={(text) => {
            const color = tinycolor(text);
            if (color.isValid()) {
              console.log('new color: ', color.toHex8String());
              setChildColor(color.toHex8String());
            }
          }}/>

          <NameValue name='Paint Inside' value={paintInside}/>
          <Switch value={paintInside} onValueChange={setPaintInside} style={styles.switch} />

        </View>

        <Shadow
          distance={distance}
          startColor={startColor}
          finalColor={finalColor}
          offset={[offsetX, offsetY]}
          paintInside={paintInside}
          // sides={['bottom']} corners={['bottomLeft']}
          getChildRadius={getChildRadius}
          radius={getChildRadius ? undefined : borderRadius}
          containerViewStyle={{ margin: 100 }}
        >
          <View style={{ width: 200, height: 200, backgroundColor: childColor,
            // If borderRadius change from a positive value to a negative one, it won't change the current radius.
            // This is here just to avoid the slider causing it to happen, for fast movements. You can disable this line
            // to see what I mean. Nothing to worry about in prod envs.
            borderRadius: Math.max(borderRadius, 0),
          }}/>
        </Shadow>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flex: 1,
    backgroundColor: '#ececec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    color: '#444',
    fontSize: 14,
    fontWeight: 'bold',
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
  slider: {
    width: 160,
    marginBottom: 18,
  },
  switch: {
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: '#fff',
    borderColor: '#333',
    borderRadius: 3,
    paddingVertical: 3,
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingHorizontal: 4,
    width: '60%',
    fontSize: 14,
    borderWidth: 1,
    marginBottom: 12,
    fontFamily: 'monospace',
  },
});