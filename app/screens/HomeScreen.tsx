import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { auth } from '../firebaseconfig';
import { signOut } from 'firebase/auth';
import { ImageBackground, StyleSheet, View, Image, Text, TouchableOpacity, Alert } from 'react-native';

export default function HomeScreen() {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Signed Out Successfully!')
      navigation.navigate('Auth');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }

  const handleSettings =  () => {
    Alert.alert('Settings', 'NOT IMPLEMENTED YET')
    // implement settings page after stufffffz
  }

  return (
    <View>
      <Text style={styles.credit}>Made by Wajeeh Alam</Text>
      {/* dropdown stuff */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setDropdownVisible(!dropdownVisible)}
      >
        <Text style={styles.menuText}>⋮</Text>
      </TouchableOpacity>

      {/* actual dropdown menu now */}
      {dropdownVisible && (
        <View style={styles.dropdown}>
          <TouchableOpacity style={styles.dropdownItem} onPress={handleSettings}>
            <Text style={styles.dropdownText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
            <Text style={styles.dropdownText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

{/* <ImageBackground 
    source={require('../../assets/images/homepagegradient.png')}
    style={styles.background}
    /> */}
      
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
  },
  menuButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#444',
    borderRadius: 10,
    padding: 10,
  },
  menuText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  dropdown: {
    position: 'absolute',
    top: 80,
    right: 20, 
    backgroundColor: "#FFFOOO",
    borderRadius: 10,
    padding: 10, 
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 1},
    shadowRadius: 3.14,
    elevation: 5,
  },
  dropdownItem: {
    padding: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: "#000000",
  },
})