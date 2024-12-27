import React, { useState } from 'react';
import { ImageBackground, StyleSheet, View, Image, Text, TextInput, TouchableOpacity, Alert, Touchable, KeyboardAvoidingView, ScrollView, Platform, Modal } from 'react-native';
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
    const allowedDomains = ['gmail.com', 'outlook.com', 'yahoo.ca']

    if (!email || !password) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Invalid email format.');
      return;
    }
  
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
  
    try {
      if (isRegisterMode) {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert('Success', 'Account Created Successfully');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        Alert.alert('Success', 'Signed In Successfully!');
      }
      setShowForm(false);
    } catch (error: any) {
      console.error('Firebase Auth Error:', error); // Debugging
      Alert.alert('Error', error.message || 'Something went wrong.');
    }
  };
  

  return (
    <KeyboardAvoidingView
      style={{ flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <ImageBackground 
        style={styles.background} 
        source={require('../../assets/images/landinggradient.png')}
        >
          <View style={styles.logoContainer}>
            <Image style={styles.logo} source={require('../../assets/images/SQLogo.png')}/>
            <Text style={styles.logoText}>STUDYQUEST</Text>
            <View style={styles.slogans}>
              <Text style={styles.sloganText}>• Turn studying into an adventure</Text>
              <Text style={styles.sloganText}>• Track your progress, level up, and crush your goals!</Text>
              <Text style={styles.sloganText}>• Compete and gamify your learning experience with XP and levels!</Text>
            </View>
          </View>
            <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
              <Text style={[styles.buttonText]}>LOGIN</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.registerButton} onPress={handleRegisterPress}>
              <Text style={[styles.buttonText]}>REGISTER</Text>
            </TouchableOpacity>


            <Modal
              visible={showForm}
              transparent
              animationType="slide"
              onRequestClose={() => setShowForm(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.inputText}>EMAIL</Text> 
                  <TextInput 
                    style={styles.input}
                    placeholder="EMAIL"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType='email-address'
                  />
                  <Text style={styles.inputText}>PASSWORD</Text> 
                  <TextInput 
                    style={styles.input}
                    placeholder="PASSWORD"
                    value={password}
                    onChangeText={setPassword}
                    keyboardType='visible-password'
                  />
                  <TouchableOpacity style={styles.authButton} onPress={handleAuthAction}>
                    <Text style={styles.buttonText}>{isRegisterMode ? 'REGISTER' : 'LOGIN'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowForm(false)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ImageBackground>
      </ScrollView>
    </KeyboardAvoidingView>
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
    margin: 10,
    marginBottom: 20,
  },
  authButton: {
    backgroundColor: '#5b0128',
    width: '40%',
    padding: 15,
    alignItems: 'center',
  },
  cancelText: {
    color: '#FFFFFF',
    margin: 20,
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000'
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: '#EF4H6B',
    borderRadius: 20,
    alignItems: 'center',
    margin: 20,
  },
  inputText: {
    margin: 20,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'AnnieUseYourTelescope-Regular',
  }
});