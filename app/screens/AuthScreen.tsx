import React, { useState, useEffect } from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../firebase/firebaseconfig'; 
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';

export default function AuthScreen() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);    // toggling between login & register
  const [showForm, setShowForm] = useState(false);                // show/hide email/pass input modal
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);    // show/hide forgot-password modal
  const navigation = useNavigation();

  // Auto-navigate to Home if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.navigate('Home');
      }
    });
    return unsubscribe;
  }, []);

  // Show Login modal
  const handleLoginPress = () => {
    setIsRegisterMode(false);
    setShowForm(true);
  };

  // Show Register modal
  const handleRegisterPress = () => {
    setIsRegisterMode(true);
    setShowForm(true);
  };

  // Handle sending a reset email
  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Success', 'Password reset email sent! Check your inbox shortly.');
      setShowResetModal(false);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // Handle Login or Register
  const handleAuthAction = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Invalid email format.');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    try {
      if (isRegisterMode) {
        // Register
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert('Success', 'Account Created Successfully!');
      } else {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
        Alert.alert('Success', 'Signed In Successfully!');
        navigation.navigate('Home');
      }
      setShowForm(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <ImageBackground
          style={styles.background}
          source={require('../../assets/images/landinggradient.png')}
        >
          {/* Logo & Slogans */}
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              source={require('../../assets/images/favicon.png')}
            />
            <Text style={styles.logoText}>STUDYQUEST</Text>
            <View style={styles.slogans}>
              <Text style={styles.sloganText}>• Turn studying into an adventure</Text>
              <Text style={styles.sloganText}>• Track your progress, level up, and crush your goals!</Text>
              <Text style={styles.sloganText}>• Compete and gamify your learning experience with XP and levels!</Text>
            </View>
          </View>

          {/* Main Buttons */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
            <Text style={styles.buttonText}>LOGIN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerButton} onPress={handleRegisterPress}>
            <Text style={styles.buttonText}>REGISTER</Text>
          </TouchableOpacity>

          {/* Login/Register */}
          <Modal
            visible={showForm}
            transparent
            animationType="slide"
            onRequestClose={() => setShowForm(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                {/* EMAIL */}
                <Text style={styles.inputText}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />

                {/* PASSWORD */}
                <Text style={styles.inputText}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                {/* Forgot Password (Login mode) */}
                {!isRegisterMode && (
                  <TouchableOpacity
                    onPress={() => {
                      // Close the LOGIN modal, then open reset modal
                      setShowForm(false);
                      setShowResetModal(true);
                    }}
                  >
                    <Text style={styles.cancelText}>Forgot Password?</Text>
                  </TouchableOpacity>
                )}

                {/* LOGIN or REGISTER Button */}
                <TouchableOpacity style={styles.authButton} onPress={handleAuthAction}>
                  <Text style={styles.buttonText}>
                    {isRegisterMode ? 'REGISTER' : 'LOGIN'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowForm(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Password Reset */}
          <Modal
            visible={showResetModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowResetModal(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.inputText}>
                  Enter Your Email To Reset Password
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoFocus={true}
                />
                <TouchableOpacity style={styles.authButton} onPress={handlePasswordReset}>
                  <Text style={styles.resetPassword}>RESET PASSWORD</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowResetModal(false)}>
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
  logoContainer: {
    position: 'absolute',
    top: 70,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  modalContent: {
    width: '85%',
    padding: 20,
    backgroundColor: '#EF4H6B',
    borderRadius: 20,
    alignItems: 'center',
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
  inputText: {
    margin: 10,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'AnnieUseYourTelescope-Regular',
    textAlign: 'center'
  },
  input: {
    width: '70%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    margin: 10,
  },
  authButton: {
    backgroundColor: '#5b0128',
    width: '40%',
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelText: {
    color: '#FFFFFF',
    margin: 20,
    textDecorationLine: 'underline',
  },
  resetPassword: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});