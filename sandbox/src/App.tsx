// Sandbox to test the library. I tried using the symlink npx workaround but it's somewhat bugged.
// Using a copy of the lib code here.
import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch, TextInput, Pressable } from 'react-native';
import { Shadow } from './index';
import Slider from '@react-native-community/slider';
import tinycolor from 'tinycolor2';
import { PageScrollView } from 'pagescrollview';
import RadioForm from 'react-native-simple-radio-button';


export const App: React.FC = () => {
  const [distance, setDistance] = useState(defaults.distace);
  const [borderRadius, setBorderRadius] = useState(defaults.borderRadius);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [paintInside, setPaintInside] = useState<boolean | undefined>(undefined);
  const [getChildRadius, setGetChildRadius] = useState(true);
  const [size, setSize] = useState([defaults.width, defaults.height] as [number, number]);
  const [doUseSizeProp, setDoUseSizeProp] = useState(false);

  const [childWidth, setChildWidth] = useState(defaults.width);
  const [childHeight, setChildHeight] = useState(defaults.height);

  const [startColor, setStartColor] = useState(defaults.startColor);
  const [finalColor, setFinalColor] = useState(defaults.finalColor);
  const [childColor, setChildColor] = useState(defaults.childColor);

  return (
    <PageScrollView viewStyle={styles.container}>

      <Text style={styles.title}>{`react-native-shadow-2 sandbox`}</Text>
      <Text style={styles.subtitle}>{`By SrBrahma @ https://github.com/SrBrahma/react-native-shadow-2`}</Text>

      <View style={styles.sandbox}>
        <View style={styles.settings}>

          <MySlider name='Child Width' step={0.1} range={[0, 200]} value={childWidth} onValueChange={setChildWidth}/>
          <MySlider name='Child Height' step={0.1} range={[0, 200]} value={childHeight} onValueChange={setChildHeight}/>
          <MySlider name='Distance' value={distance} onValueChange={setDistance}
            range={[-10, 100]}  // min -10 to show < 0 won't do anything
          />
          <MySlider name='Border Radius' value={borderRadius} onValueChange={setBorderRadius}
            range={[-10, 100]}  // min -10 to show < 0 won't do anything
          />
          <MySlider name='Offset X' range={[-20, 20]} value={offsetX} onValueChange={setOffsetX}/>
          <MySlider name='Offset Y' range={[-20, 20]} value={offsetY} onValueChange={setOffsetY}/>


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
          <RadioForm
            initial={undefined}
            radio_props={[{ label: 'undefined', value: undefined }, { label: 'false', value: false }, { label: 'true', value: true }] as any}
            onPress={v => setPaintInside(v)}
            formHorizontal
            labelHorizontal={false}
          />

          <MySwitch name='Use Size Prop' value={doUseSizeProp} onValueChange={setDoUseSizeProp}/>
          <MySlider name='Size Width Prop' step={0.1} range={[0, 200]} value={size[0]} onValueChange={v=>setSize([v, size[1]])}/>
          <MySlider name='Size Height Prop' step={0.1} range={[0, 200]} value={size[1]} onValueChange={v=>setSize([size[0], v])}/>

        </View>

        <Shadow
          distance={distance}
          startColor={startColor}
          finalColor={finalColor}
          offset={(offsetX || offsetY) ? [offsetX, offsetY] : undefined} // To test paintInside default
          paintInside={paintInside}
          getChildRadiusStyle={getChildRadius}
          radius={getChildRadius ? undefined : borderRadius}
          containerViewStyle={{ margin: 100 }}
          size={doUseSizeProp ? size : undefined}
          viewStyle={doUseSizeProp ? { backgroundColor: childColor } : undefined}
        >
          <View style={[!doUseSizeProp && { width: childWidth, height: childHeight }, {
            backgroundColor: childColor,
            // If borderRadius change from a positive value to a negative one, it won't change the current radius.
            // This is here just to avoid the slider causing it to happen, for fast movements. You can disable this line
            // to see what I mean. Nothing to worry about in prod envs.
            borderRadius: Math.max(borderRadius, 0),
          }]}/>
        </Shadow>
      </View>


    </PageScrollView>
  );
};


const defaults = {
  distace: 50,
  borderRadius: 30,
  width: 200,
  height: 200,
  startColor: tinycolor('#00000020').toHex8String(),
  finalColor: tinycolor('#0000').toHex8String(),
  childColor: tinycolor('#fff').toHex8String(),
};


const NameValue: React.FC<{
  name: string, value: string | number | boolean | undefined, valueMonospace?: boolean
}> = ({ name, value, valueMonospace = false }) => {
  const prettyValue = typeof value === 'number' ? value.toFixed(1).replace(/[.,]0+$/, '') : String(value); // https://stackoverflow.com/a/5623195/10247962
  return (
    <View style={{
      alignSelf: 'stretch',
      flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2,
    }}>
      <Text style={{ fontSize: 16 }}>{name}</Text>
      <Text style={{ fontSize: 16, fontWeight: 'bold', fontFamily: valueMonospace ? 'monospace' : undefined }}>{prettyValue}</Text>
    </View>);
};


const MySlider: React.FC<{
  name: string;
  step?: number;
  range: [min: number, max: number];
  value: number
  onValueChange: (value: number) => void
}> = ({ name, step = 1, range, value, onValueChange }) => {
  return (
    <View style={{ marginBottom: 18 }}>
      <NameValue {...{ name, value }} />
      <View style={{ flexDirection: 'row' }}>
        <Pressable onPress={() => onValueChange(value - step)} style={({ pressed }) => [styles.decIncButton, pressed && { backgroundColor: '#bbb' }]}>
          <Text selectable={false} style={{ fontSize: 16, fontWeight: 'bold' }}>{'-'}</Text>
        </Pressable>
        <Slider style={{ width: 140, marginHorizontal: 20 }} minimumValue={range[0]} maximumValue={range[1]}
          {...{ step, value, onValueChange }}
        />
        <Pressable onPress={() => onValueChange(value + step)} style={({ pressed }) => [styles.decIncButton, pressed && { backgroundColor: '#bbb' }]}>
          <Text selectable={false} style={{ fontSize: 16, fontWeight: 'bold' }}>{'+'}</Text>
        </Pressable>
      </View>
    </View>
  );
};


const MySwitch: React.FC<{
  name: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}> = ({ name, onValueChange, value }) => {
  return (<>
    <NameValue name={name} value={value}/>
    <Switch value={value} onValueChange={onValueChange} style={styles.switch} />
  </>);
};


const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
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
    marginBottom: 10,
  },
  sandbox: {
    width: '100%',
    flexWrap: 'wrap-reverse', // to make it responsive, with the shadow component being above the settings on small screens
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignContent: 'space-between',
    justifyContent: 'space-evenly',
  },
  settings: {
    marginTop: 40,
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