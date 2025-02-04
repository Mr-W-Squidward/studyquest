import { Stack } from "expo-router";
import * as Font from 'expo-font';
import React, { useState, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

const loadFonts = async () => {
  await Font.loadAsync({
    'Baskervville-Regular': require('../assets/fonts/Baskervville-Regular.ttf'),
    'AnnieUseYourTelescope-Regular': require('../assets/fonts/AnnieUseYourTelescope-Regular.ttf'),
    'InriaSans-Regular': require('../assets/fonts/InriaSans-Regular.ttf'),
    'LifeSavers-Regular': require('../assets/fonts/LifeSavers-Regular.ttf'),
  })
}

export default function RootLayout({ children }: any) {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    loadFonts().then(() => setFontsLoaded(true))
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large"/>
      </View>
    )
  }

  return <Stack screenOptions={{headerShown: false}}/>;
}