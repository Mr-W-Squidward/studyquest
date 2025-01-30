import { useNavigation } from '@react-navigation/native';
import React, { useState, useRef, useEffect } from 'react';
import { auth, db } from '../../firebase/firebaseconfig';
import { signOut } from 'firebase/auth';
import { useStudySession } from '../context/StudySessionContext';
import { 
  ImageBackground, 
  StyleSheet, 
  View, 
  Image, 
  Text, 
  TouchableOpacity, 
  Alert, 
  Animated, 
  Modal,
  Easing, 
  ScrollView, 
  TextInput,
} 
from 'react-native';
import {  
  addPlayer,
  subscribeToLeaderboard,
  Player,
} from '../../firebase/firebaseService';
import { arrayUnion, doc, getDoc, increment, updateDoc } from 'firebase/firestore';
import Navbar from '../components/navbar';

export default function HomeScreen() {
  const { isStudying, minutesStudied, xp, startStudying, stopStudying } = useStudySession();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [playerRank, setPlayerRank] = useState<number>(1);
  const [competitor, setCompetitor] = useState<string | null>(null);
  const [beatingCompetitorBy, setBeatingCompetitorBy] = useState<number | null | string>(null);
  const [xpUntilNextRank, setXpUntilNextRank] = useState<number | null | string>(null);
  const [studySessions, setStudySessions] = useState(0);
  const [remainingMinutes, setRemainingMinutes] = useState(0);

  const [newUsername, setNewUsername] = useState('');
  const [username, setUsername] = useState<string | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  const animatedValue = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  // Initialize Player Function
  useEffect(() => {
    const initializePlayer = async () => {
      await addPlayer();
  
      const user = auth.currentUser;
      if (user) {
        const playerDoc = await getDoc(doc(db, 'leaderboard', user.uid));
        if (playerDoc.exists()) {
          const data = playerDoc.data();
          setRemainingMinutes(data?.remainingMinutes || data?.minutesStudied || 0);
  
          if (!data?.username) {
            setShowUsernameModal(true);
          } else {
            setUsername(data?.username);
          }
        }
      }
    };
  
    initializePlayer();
  
    // Leaderboard subscription / Rank setting
    const unsubscribe = subscribeToLeaderboard((updatedLeaderboard) => {
      setLeaderboard(updatedLeaderboard);
  
      const user = auth.currentUser;
      if (user) {
        const playerRankIndex = updatedLeaderboard.findIndex(
          (player) => player.id === user.uid
        );
  
        if (playerRankIndex !== -1) {
          const newRank = playerRankIndex + 1;
          setPlayerRank(newRank);
  
          if (playerRankIndex < updatedLeaderboard.length - 1) {
            const competitorPlayer = updatedLeaderboard[playerRankIndex + 1];
            const xpDifference =
              (updatedLeaderboard[playerRankIndex]?.xp || 0) -
              parseFloat(Number(competitorPlayer?.xp || 0).toFixed(1));
            const minutesDifference = parseFloat((xpDifference / 10).toFixed(2)); // assuming 10 xp = 1 min
  
            setCompetitor(
              competitorPlayer?.username
                ? '-' + competitorPlayer.username + '-'
                : 'NO COMPETITOR'
            );
            setBeatingCompetitorBy(minutesDifference.toFixed(1));
            setXpUntilNextRank(
              parseFloat(
                (
                  (updatedLeaderboard[playerRankIndex - 1]?.xp || 0) -
                  (updatedLeaderboard[playerRankIndex]?.xp || 0)
                ).toFixed(1)
              )
            );
          } else {
            setCompetitor('No Competitor...');
            setBeatingCompetitorBy('-∞');
            const xpUntilRankUp = playerRankIndex < updatedLeaderboard.length - 1 ? '∞' :
              ((updatedLeaderboard[playerRankIndex - 1]?.xp || 0) -
              (updatedLeaderboard[playerRankIndex]?.xp || 0));
            setXpUntilNextRank(typeof xpUntilRankUp === 'number' ? xpUntilRankUp.toFixed(1) : xpUntilRankUp);
          }
        }
      }
    });
  
    return () => unsubscribe(); // Clean up
  }, []);
  
  // Username Setup 
  const saveUsername = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("No user currently logged in.");
      return;
    }

    if (!newUsername.trim() || newUsername.length < 5) {
      Alert.alert("Error", "Username must be at least 5 characters long.");
      return;
    }

    // Add username to firestore
    try {
      const playerDocRef = doc(db, 'leaderboard', user.uid);
      await updateDoc(playerDocRef, { username: newUsername.trim() });
      setUsername(newUsername.trim());
      setNewUsername('');
      setShowUsernameModal(false);
      Alert.alert('Success', 'Username updated successfully!');
    } catch (error) {
      console.error('Error updating username: ', error);
      Alert.alert('Error', 'Failed to update username. Please try again.');
    }
  }

  // Logout deauthentication
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
    navigation.navigate('Settings');
  }

  return (
    <ImageBackground
          source={require('../../assets/images/homepagegradient.png')}
          style={styles.background}
    >
      <Animated.View // Animation currently isn't working - next patch :*( rough being a lone developer...
        style=
        {[
          styles.animatedContainer, 
        {
          transform: [
            { translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0, 10] }) },
          ],
          opacity: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [1, 0.9] }),
        },
      ]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.credit}>Account: {username || 'Setting up...'}</Text>

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

            {/* DYNAMIC INFO; from firebase */}
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
              <Text style={styles.infoText}>NEXT RANK: {xpUntilNextRank} XP Required</Text>
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
            
            {/* RANK INFO */}
            <View style={styles.rankSection}>
              <Animated.Image 
                source={require('../../assets/images/crownIcon.png')} 
                style={styles.rankImage}
              />
              <Text style={styles.rank}>RANK #{playerRank}</Text>
            </View>

            <Text style={styles.competitor}>COMPETITOR: {competitor}</Text>

            <Text style={styles.beatingCompetitorBy}>You are winning by {beatingCompetitorBy} minutes.</Text>
          </View>
          
          {/* USERNAME MODAL */}
          <Modal
            visible={showUsernameModal}
            transparent={true}
            animationType='slide'
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Set Your Username</Text>
                <TextInput 
                  style={styles.input}
                  placeholder='Enter Your Username'
                  value={newUsername}
                  onChangeText={setNewUsername}
                />
                <TouchableOpacity style={styles.saveButton} onPress={saveUsername}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
      </ScrollView>
    </Animated.View>
    <Navbar activeTab="Home"/>
  </ImageBackground>
  );
}
      
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderColor: "#CCC",
    marginBottom: 20,
    padding: 10,
  },
  saveButton: {
    backgroundColor: "#5b0128",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  rankSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rank: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'AnnieUseYourTelescope-Regular',
    textShadowColor: '#000000',
    textShadowRadius: 5,
    textShadowOffset: { width: 4, height: 4},
  },
  rankImage: {
    height: 40,
    width: 40,
  },
  competitor: {
    textAlign: 'center',
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'AnnieUseYourTelescope-Regular',
    textShadowColor: '#000000',
    textShadowRadius: 5,
    textShadowOffset: { width: 4, height: 4},
    marginVertical: 10,
  },
  beatingCompetitorBy: {
    textAlign: 'center',
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'AnnieUseYourTelescope-Regular',
    textShadowColor: '#000000',
    textShadowRadius: 5,
    textShadowOffset: { width: 4, height: 4},
    marginVertical: 10,
  },
  scrollContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 35,
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
    width: '100%',
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
    marginTop: 10,
    marginBottom: 20,
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
    top: 90,
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