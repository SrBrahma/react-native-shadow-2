// Quick code to manually test the package.

import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch, ScrollView } from 'react-native';
import { Shadow } from './index';
import Slider from '@react-native-community/slider';
// import { version } from '../../package.json'; // isn't added in expo

const version = '2.0.0';

const childColorBlackAndWhite = '#fff';
const shadowColorBlackAndWhite = '#0002';
const childColorHighContrast = '#87e911';
const shadowColorHighContrast = '#0057e9d0';

export const App: React.FC = () => {
  const [distance, setDistance] = useState(54);
  const [borderRadius, setBorderRadius] = useState(30);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [paintInside, setPaintInside] = useState(false);
  const [getChildRadius, setGetChildRadius] = useState(true);

  const [highContrast, setHighContrast] = useState(true);
  // const [childColor, setChildColor] = useState(childColorHighContrast);
  // const [shadowColor, setShadowColor] = useState(shadowColorHighContrast);

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>{`react-native-shadow-2 v${version} sandbox`}</Text>
      <Text style={styles.subtitle}>{`By SrBrahma @ https://github.com/SrBrahma/react-native-shadow-2`}</Text>

      <View style={styles.sandbox}>
        <View style={styles.settings}>
          <Text>{`Distance: ${distance}`}</Text>
          <Slider style={styles.slider} step={1}
            minimumValue={-10} maximumValue={100} // min -10 to show < 0 won't do anything
            value={distance} onValueChange={setDistance}
          />
          <Text>{`Border Radius: ${borderRadius}`}</Text>
          <Slider style={styles.slider} step={1}
            minimumValue={-10} maximumValue={100} // min -10 to show < 0 won't do anything
            value={borderRadius} onValueChange={setBorderRadius}
          />
          <Text>{`Offset X: ${offsetX}`}</Text>
          <Slider style={styles.slider} step={1}
            minimumValue={-20} maximumValue={20} // min -10 to show < 0 won't do anything
            value={offsetX} onValueChange={setOffsetX}
          />
          <Text>{`Offset Y: ${offsetY}`}</Text>
          <Slider style={styles.slider} step={1}
            minimumValue={-20} maximumValue={20} // min -10 to show < 0 won't do anything
            value={offsetY} onValueChange={setOffsetY}
          />

          <Text>{`Paint Inside: ${paintInside}`}</Text>
          <Switch value={paintInside} onValueChange={setPaintInside} style={styles.switch} />

          {/* <Text style={{ marginBottom: 3 }}>{`getChildRadius: ${getChildRadius}`}</Text>
          <Text style={styles.description}>{'False will also set radius={borderRadius}.'}</Text>
          <Text style={[styles.description, { marginBottom: 2 }]}>{`Won't change the result here, it's just for testing.`}</Text>
          <Switch value={getChildRadius} onValueChange={setGetChildRadius} style={styles.switch}/> */}

          <Text>{`Colors: ${highContrast ? 'High contrast' : 'Black and white'}`}</Text>
          <Switch value={highContrast} onValueChange={setHighContrast} style={styles.switch} />

        </View>

        <Shadow
          distance={distance}
          startColor={highContrast ? shadowColorHighContrast : shadowColorBlackAndWhite}
          offset={[offsetX, offsetY]}
          paintInside={paintInside}
          // sides={['bottom']} corners={['bottomLeft']}
          getChildRadius={getChildRadius}
          radius={getChildRadius ? undefined : borderRadius}
          containerViewStyle={{ margin: 100 }}
        >
          <View style={{ width: 200, height: 200, backgroundColor: highContrast ? childColorHighContrast : childColorBlackAndWhite,
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
    backgroundColor: '#e4e4e4',
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
    width: 150,
    marginBottom: 20,
  },
  switch: {
    marginBottom: 20,
  },
  description: {
    fontSize: 12,
    color: '#444',
  },
});