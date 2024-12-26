import React from 'react';
import { ImageBackground, StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';

export default function HomeScreen() {

  return (
    <ImageBackground 
    source={require('../../assets/images/homepagegradient.png')}
    style={styles.background}
    >
      <Text style={styles.credit}>Made by Wajeeh Alam</Text>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  credit: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'AnnieUseYourTelescope-Regular',
    textShadowColor: '#000000',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 1,
  }
})