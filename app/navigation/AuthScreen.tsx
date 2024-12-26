import React, { useState } from 'react';
import { ImageBackground, StyleSheet, View, Image, Text, TextInput, TouchableOpacity, Alert, Touchable } from 'react-native';
import { auth } from '../firebaseconfig'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';



export default function AuthScreen() {
  const [isRegisterMode, setIsRegisterMode] = useState(false); // toggling between login n register
  const [showForm, setShowForm] = useState(false); // show n hide email/pass input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const handleLoginPress = () => {
    setIsRegisterMode(false);
    setShowForm(true);
    console.log('login butn pressed boi, navigate to login!!!')
  }

  const handleRegisterPress = () => {
    setIsRegisterMode(true);
    setShowForm(true);
    console.log('regista pressed boi, navigate to register!!!')
  }

  const handleAuthAction = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    try {
      if (isRegisterMode) {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert('Success', 'Account Created Successfully');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        Alert.alert('Success', 'Signed In Successfully!')
      } 
      setShowForm(false);
    } catch (error: any) {
      Alert.alert('Error', error.message)
    }
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
      {!showForm ? (
        <>
          <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
            <Text style={[styles.buttonText]}>LOGIN</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerButton} onPress={handleRegisterPress}>
            <Text style={[styles.buttonText]}>REGISTER</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.authForm}>
          <TextInput 
            style={styles.input}
            placeholder='EMAIL'
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput 
            style={styles.input}
            placeholder='PASSWORD'
            value={password}
            onChangeText={setPassword}
            keyboardType="visible-password"
          />
          <TouchableOpacity style={styles.authButton} onPress={handleAuthAction}>
            <Text style={styles.buttonText}>{isRegisterMode ? 'REGISTER' : 'LOGIN'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowForm(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
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
  authForm: {
    width: '50%',
    alignItems: 'center',
    marginBottom: 100,
  },
  input: {
    width: '50%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    marginVertical: 10,
  },
  authButton: {
    backgroundColor: '#5b0128',
    width: '40%',
    padding: 15,
    alignItems: 'center',
  },
  cancelText: {
    color: '#FFFFFF',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
});