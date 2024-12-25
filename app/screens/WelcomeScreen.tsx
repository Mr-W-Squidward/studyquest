import React from 'react';
import { ImageBackground, StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';

export default function WelcomeScreen() {

  const handleLoginPress = () => {
    console.log('login butn pressed boi, navigate to login!!!')
  }

  const handleRegisterPress = () => {
    console.log('regista pressed boi, navigate to register!!!')
  }

  return (
    <ImageBackground 
    style={styles.background} 
    source={require('../../assets/images/landinggradient.png')}
    >
      <View style={styles.logoContainer}>
        <Image style={styles.logo} source={require('../../assets/images/SQLogo.png')}/>
        <Text style={styles.logoText}>STUDYQUEST</Text>
        <View style={styles.slogans}>
          <Text style={styles.sloganText}>• Turn <strong>studying</strong> into an adventure</Text>
          <Text style={styles.sloganText}>• Track your progress, <strong>level up</strong>, and crush your goals!</Text>
          <Text style={styles.sloganText}>• <strong>Compete</strong> and gamify your learning experience with <strong>XP</strong> and levels!</Text>
      </View>
      </View>
      <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
        <Text style={[styles.buttonText]}>LOGIN</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.registerButton} onPress={handleRegisterPress}>
        <Text style={[styles.buttonText]}>REGISTER</Text>
      </TouchableOpacity>
    </ImageBackground>

  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  slogans: {
    top: 90,
    alignItems: 'center',
  },
  sloganText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'AnnieUseYourTelescope-Regular',
    textShadowColor: '#000000',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 1,
    margin: 10,
  },
  buttonContainer: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#5b0128',
    width: '80%',
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
    alignItems: 'center',
  },
  registerButton: {
    backgroundColor: '#7e1140',
    width: '80%',
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 40,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 100,
    shadowColor: '#000000',
    shadowRadius: 5, // i dont know how to add drop shadow to this bruh
    textShadowOffset: { width: 5, height: 4 } // i still don't know...
  },
  logoContainer: {
    position: 'absolute',
    top: 70,
    alignItems: 'center',
  },
  logoText: {
    top: 50,
    color: '#FFFFFF',
    fontSize: 45,
    fontFamily: 'Baskervville-Regular',
    textShadowColor: '#000000',
    textShadowOffset: { width: 8, height: 4 },
    textShadowRadius: 5,
  },
})