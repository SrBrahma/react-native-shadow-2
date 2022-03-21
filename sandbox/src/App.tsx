// Sandbox to test the library. I tried using the symlink npx workaround but it's somewhat bugged.
// Using a copy of the lib code here.
import React, { useState } from 'react';
import { I18nManager, Platform, Pressable, StatusBar, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Slider } from '@sharcoux/slider';
import { PageScrollView } from 'pagescrollview';
import tinycolor from 'tinycolor2';
import { Shadow } from './src/index'; // Aliased in Sandbox in dev.



const defaults = {
  distace: 50,
  borderRadius: 30,
  width: 200,
  height: 200,
  startColor: tinycolor('#00000020').toHex8String(),
  finalColor: tinycolor('#0000').toHex8String(),
  childColor: tinycolor('#fff').toHex8String(), // tinycolor('#fff').toHex8String(),
};


export const App: React.FC = () => {
  const [distance, setDistance] = useState(defaults.distace);
  const [borderRadius, setBorderRadius] = useState(defaults.borderRadius);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [paintInside, setPaintInside] = useState<boolean | undefined>(undefined);

  const [getChildRadius, setGetChildRadius] = useState(true);
  const [getStyleRadius, setGetViewStyleRadius] = useState(true);

  const [size, setSize] = useState([defaults.width, defaults.height] as [number, number]);
  const [doUseSizeProp, setDoUseSizeProp] = useState(true);

  const [childWidth, setChildWidth] = useState(defaults.width);
  const [childHeight, setChildHeight] = useState(defaults.height);

  const [startColor, setStartColor] = useState(defaults.startColor);
  const [finalColor, setFinalColor] = useState(defaults.finalColor);
  const [childColor, setChildColor] = useState(defaults.childColor);

  const [rtl, setRtl] = useState(false);

  // const [inset, setInset] = useState(true);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar backgroundColor={'#222'}/>
        <PageScrollView style={styles.container}>

          <Text style={styles.title}>{`react-native-shadow-2 sandbox`}</Text>
          <Text style={styles.subtitle}>{`By SrBrahma @ https://github.com/SrBrahma/react-native-shadow-2`}</Text>

          <View style={styles.sandbox}>
            {/** Can't get this scroll to work properly in web */}
            <View style={styles.settings}>
              {/** View necessary so the settings won't grow too large in width */}
              <View>
                <MySlider name='Size Width Prop' step={0.1} range={[0, 200]} value={size[0]} onValueChange={(v)=>setSize([v, size[1]])}/>
                <MySlider name='Size Height Prop' step={0.1} range={[0, 200]} value={size[1]} onValueChange={(v)=>setSize([size[0], v])}/>
                <MySwitch
                  name='Use Size Prop' value={doUseSizeProp} onValueChange={setDoUseSizeProp}
                  description={'True uses the size prop (width and\nheight above), else obtains the child size.'}
                />
                <MySlider name='Child Width' step={0.1} range={[0, 200]} value={childWidth} onValueChange={setChildWidth}/>
                <MySlider name='Child Height' step={0.1} range={[0, 200]} value={childHeight} onValueChange={setChildHeight}/>
                <MySlider name='Distance' value={distance} onValueChange={setDistance}
                  range={[-10, 100]} step={0.1} // min -10 to show < 0 won't do anything
                />
                <MySlider name='Border Radius' value={borderRadius} onValueChange={setBorderRadius}
                  range={[-10, 100]} step={0.1} // min -10 to show < 0 won't do anything
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

                <MySwitch
                  name='Use RTL' value={rtl} onValueChange={(v) => {setRtl(v); I18nManager.forceRTL(v);}}
                />

                {/* <NameValue name='Paint Inside' value={paintInside}/> */}
                {/* <RadioForm // this $%&# added animations to all views.
                  initial={undefined}
                  radio_props={[{ label: 'undefined', value: undefined }, { label: 'false', value: false }, { label: 'true', value: true }] as any}
                  onPress={(v) => setPaintInside(v)}
                  formHorizontal
                  labelHorizontal={false}
                /> */}

              </View>
            </View>

            {/* Max child width is 200 and max dist is 100. Total max is 400. */}
            <View style={{ width: 420, height: 420, justifyContent: 'center', alignItems: 'center' }}>
              <Shadow
                distance={distance}
                startColor={startColor}
                finalColor={finalColor}
                offset={(offsetX || offsetY) ? [offsetX, offsetY] : undefined} // To test paintInside default
                paintInside={paintInside}
                getChildRadius={getChildRadius}
                getStyleRadius={getStyleRadius}
                containerStyle={{ margin: 100 }}
                size={doUseSizeProp ? size : undefined}
                radius={getChildRadius ? undefined : borderRadius}
                // TopEnd to check if it's supporting the Start/End combinations. When uncommenting this, also comment radius prop above.
                // style={[doUseSizeProp && { backgroundColor: childColor }, { borderTopLeftRadius: 100, borderTopEndRadius: 10 }]}
                style={[doUseSizeProp && { backgroundColor: childColor }]}
              >
                <View style={[
                  !doUseSizeProp && { width: childWidth, height: childHeight }, {
                    backgroundColor: childColor,
                    // If borderRadius change from a positive value to a negative one, it won't change the current radius.
                    // This is here just to avoid the slider causing it to happen, for fast movements. You can disable this line
                    // to see what I mean. Nothing to worry about in prod envs.
                    borderRadius: Math.max(borderRadius, 0),
                  },
                ]}/>
              </Shadow>
            </View>
          </View>


        </PageScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};



const NameValue: React.FC<{
  name: string; value: string | number | boolean | undefined; valueMonospace?: boolean;
}> = ({ name, value, valueMonospace = false }) => {
  const prettyValue = typeof value === 'number' ? value.toFixed(1).replace(/[.,]0+$/, '') : String(value); // https://stackoverflow.com/a/5623195/10247962
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 2,
    }}>
      <Text style={{ fontSize: 16 }}>{name}</Text>
      <Text style={{ fontSize: 16, fontWeight: 'bold', fontFamily: valueMonospace ? 'monospace' : undefined }}>{prettyValue}</Text>
    </View>);
};


const MySlider: React.FC<{
  name: string;
  step?: number;
  range: [min: number, max: number];
  value: number;
  onValueChange: (value: number) => void;
}> = ({ name, step = 1, range, value, onValueChange }) => {
  return (
    <View style={{ marginBottom: 18 }}>
      <NameValue {...{ name, value }}/>
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
  description?: string;
  onValueChange: (value: boolean) => void;
}> = ({ name, onValueChange, value, description }) => {
  return (
    <View style={{ marginTop: 2, marginBottom: 18, flexShrink: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 16 }}>{name}</Text>
        <Switch value={value} onValueChange={onValueChange}/>
      </View>
      <View style={{ marginTop: 4, marginLeft: 8 }}>
        {/* I couldn't fking stop the text from growing the settings view, so I made this workaround. */}
        {description?.split('\n')?.map((t) => <Text style={styles.description} numberOfLines={1} key={t}>{t}</Text>)}
      </View>
    </View>
  );
};


// Flex all the way up to settings ScrollView: https://necolas.github.io/react-native-web/docs/scroll-view/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 30,
    marginTop: 20,
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
    flex: 1,
    flexWrap: 'wrap-reverse', // to make it responsive, with the shadow component being above the settings on small screens
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignContent: 'space-between',
    justifyContent: 'space-evenly',
    paddingBottom: 40,
  },
  settings: {
    borderRadius: 8,
    backgroundColor: '#e5e5e5',
    paddingHorizontal: 40,
    paddingVertical: 30,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    color: '#222',
    fontStyle: 'italic',
    includeFontPadding: false,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 4,
    marginBottom: 18,
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
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
  },
  decIncButton: {
    backgroundColor: '#fff',
    padding: 5,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
});