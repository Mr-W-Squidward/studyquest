import { useNavigation } from '@react-navigation/native';
import React, { useState, useRef } from 'react';
import { auth } from '../firebaseconfig';
import { signOut } from 'firebase/auth';
import { ImageBackground, StyleSheet, View, Image, Text, TouchableOpacity, Alert, Animated, Easing, ScrollView } from 'react-native';

export default function HomeScreen() {
  const [isStudying, setIsStudying] = useState(false);
  const [timer, setTimer] = useState(null);
  const [minutesStudied, setMinutesStudied] = useState(0);
  const [xp, setXP] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const xpReq = [10, 15, 23, 31, 50, 79, 102, 130, 150]; // XP thresholds for levels]
  const navigation = useNavigation();

  const startStudying = () => {
    if (!isStudying) {

      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }).start();


      setIsStudying(true);
      const interval: any = setInterval(() => {
        setMinutesStudied((prevMinutes) => parseFloat((prevMinutes+0.1).toFixed(1)));
        setXP((prevXP) => prevXP + 1) // 1 XP / min or 60 XP / min
      }, 6000) // 6000 ms = 0.1 sec
      setTimer(interval);
    }
  };

  const stopStudying = () => {
    if (isStudying) {
      clearInterval(timer);
      setIsStudying(false);

      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }).start();

      setTimer(null);
    }
  }

  const checkLevelUp = (newXP: any) => {
    if (currentLevel < xpReq.length && newXP >= xpReq[currentLevel]) {
      setCurrentLevel((prevLevel) => prevLevel+1); // LVL UP!
    }
  }

  const layoutHeight = animatedValue.interpolate({
    inputRange: [0,1],
    outputRange: [180, 300] // adjust heights for initial/expanded layouts
  });

  const layoutOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.9] // slight change in opacity
  });

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
    <ImageBackground
          source={require('../../assets/images/homepagegradient.png')}
          style={styles.background}
    >
      <Animated.View
        style=
        {[
          styles.animatedContainer, 
        {
          transform: [
            { translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0, 50] }) },
          ],
          opacity: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [1, 0.8] }),
        },
      ]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.credit}>Made by Wajeeh Alam</Text>

            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setDropdownVisible(!dropdownVisible)}
            >
              <Image
                source={require('../../assets/images/redgearicon.png')}
                style={styles.menuImage}
              />
            </TouchableOpacity>
          </View>

          {/* dropdown MENU */}
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

          <Text style={styles.title}>S T U D Y Q U E S T</Text>

          <View style={styles.infoContainer}>

            {/* DYNAMIC INFO */}
            <View style={styles.infoRow}>
              <Image source={require('../../assets/images/timericon.png')} style={styles.infoImages}/>
              <Text style={styles.infoText}>{minutesStudied.toFixed(1)} Minutes Studied</Text>
            </View>

            <View style={styles.infoRow}>
              <Image source={require('../../assets/images/xpicon.png')} style={styles.infoImages}/>
              <Text style={styles.infoText}>{xp} XP</Text>
            </View>

            <View style={styles.infoRow}>
              <Image source={require('../../assets/images/presenticon.png')} style={styles.infoImages}/>
              <Text style={styles.infoText}>NEXT LEVEL: {xpReq[currentLevel] || '--'} XP Required</Text>
            </View>
            {/* START/STOP STUDYING */}
            <View style={styles.studyingContainer}>
              <ImageBackground
                source={require('../../assets/images/buttongradient.png')}
                style={styles.studyButtonBackground}
                imageStyle={{ borderRadius: 10 }}
              >
                <TouchableOpacity
                  style={styles.studyButton}
                  onPress={isStudying ? stopStudying : startStudying}
                >
                  <Text style={styles.studyButtonText}>
                    {isStudying ? 'Stop Studying' : 'Start Studying'}
                  </Text>
                </TouchableOpacity>
              </ImageBackground>
            </View>
        </View>
      </ScrollView>
    </Animated.View>
  </ImageBackground>
  );
}
      
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  animatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    marginVertical: 10,
    margin: 10,
    padding: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 18,
    fontFamily: 'AnnieUseYourTelescope-Regular',
    color: "#FFFFFF",
  },
  infoImages: {
    marginRight: 10,
    width: 60,
    height: 60,
  },
  studyButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studyButtonText: {
    fontSize: 18,
    color: '#DF3131',
    fontWeight: 'bold',
    fontFamily: 'AnnieUseYourTelescope-Regular',
  },
  studyButtonBackground: {
    width: 200,
    height: 50,
    marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  menuImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  title: {
    marginBottom: 28,
    fontFamily: 'Baskervville-Regular',
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowRadius: 5,
    textShadowOffset: { width: 4, height: 4},
  },
  studyingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
    left: 10,
  },
  credit: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'AnnieUseYourTelescope-Regular',
    textShadowColor: '#000000',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 3,
  },
  menuButton: {
    padding: 10,
  },
  menuText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  dropdown: {
    position: 'absolute',
    top: 40,
    right: 20, 
    backgroundColor: "#682860",
    borderRadius: 10,
    padding: 10, 
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 1},
    shadowRadius: 3.14,
    elevation: 5,
    zIndex: 10,
  },
  dropdownItem: {
    padding: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: "#000000",
  },
})