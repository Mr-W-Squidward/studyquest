import { useNavigation } from '@react-navigation/native';
import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../../firebase/firebaseconfig';
import { signOut } from 'firebase/auth';
import { 
  ImageBackground, 
  StyleSheet, 
  View, 
  Image, 
  Text, 
  TouchableOpacity, 
  Alert, 
  Animated, 
  Easing, 
  ScrollView } 
from 'react-native';
import {  
  addPlayer,
  updatePlayerXP,
  fetchLeaderboard,
  subscribeToLeaderboard,
  Player,
} from '../../firebase/firebaseService';
import { arrayUnion, doc, getDoc, increment, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseconfig';
import Navbar from '../components/navbar';

export default function HomeScreen() {
  const [isStudying, setIsStudying] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [minutesStudied, setMinutesStudied] = useState(0);
  const [xp, setXP] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [playerRank, setPlayerRank] = useState<number>(1);
  const [competitor, setCompetitor] = useState<string | null>(null);
  const [beatingCompetitorBy, setBeatingCompetitorBy] = useState<number | null | string>(null);
  const [xpUntilNextRank, setXpUntilNextRank] = useState<number | null | string>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [studySessions, setStudySessions] = useState(0);

  const animatedValue = useRef(new Animated.Value(0)).current;
  const rankAnimation = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation();

  useEffect(() => {
  const initializePlayer = async () => {
    await addPlayer();
    
    const user = auth.currentUser;
    if (user) {
      const playerDoc = await getDoc(doc(db, 'leaderboard', user.uid));
      if (playerDoc.exists()) {
        const data = playerDoc.data();
        setXP(parseFloat(Number((data?.xp) ?? 0).toFixed(1)));
        setMinutesStudied(parseFloat(data?.minutesStudied ?? 0));
        setCurrentLevel(parseFloat(data?.currentLevel ?? 0));

        const username = data?.username || 'anonymous';
        setUsername(username);
      }
    }
  };
  
  initializePlayer();

  const unsubscribe = subscribeToLeaderboard((updatedLeaderboard) => {
    setLeaderboard(updatedLeaderboard);

    const user = auth.currentUser;
    if (user) {
      const playerRankIndex = updatedLeaderboard.findIndex((player) => player.id === user.uid);

      if (playerRankIndex !== -1) {
        const newRank = playerRankIndex+1;
        if (newRank !== playerRank) {
          triggerRankUpAnimation();
        }
        setPlayerRank(newRank);

        if (playerRankIndex < updatedLeaderboard.length - 1) {
          const competitorPlayer = updatedLeaderboard[playerRankIndex + 1]; // player BEHIND on leaderboard (+1)
          setCompetitor('-' + competitorPlayer.username + '-' || 'NO COMPETITOR');
          const xpUntilRankUp = (updatedLeaderboard[playerRankIndex-1]?.xp || 0) - (updatedLeaderboard[playerRankIndex]?.xp || 0)
          const xpDifference = (updatedLeaderboard[playerRankIndex]?.xp || 0 - parseFloat(Number(competitorPlayer?.xp || 0).toFixed(1)))
          const minutesDifference = parseFloat((xpDifference / 10).toFixed(1)); // assuming 10 xp = 1 min (will change prolly)
          setBeatingCompetitorBy(minutesDifference.toFixed(1));
          setXpUntilNextRank(parseFloat(xpUntilRankUp.toFixed(1)));
        } else {
          setCompetitor('No Competitor...');
          setBeatingCompetitorBy('-∞');
          const xpUntilRankUp = updatedLeaderboard[playerRankIndex-1].xp - updatedLeaderboard[playerRankIndex].xp;
          setXpUntilNextRank(xpUntilRankUp.toFixed(1));
        }
      } 
    }
  });
  return () => unsubscribe(); // clean up
}, []);

  const startStudying = () => {
    if (!isStudying) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }).start();


      setIsStudying(true);
      setStartTime(Date.now());

      const interval: any = setInterval(() => {
        setMinutesStudied((prev) => parseFloat((prev+0.1).toFixed(1)));
        setXP((prevXP) => {
          const newXP = (prevXP || 0) + 1;
          return parseFloat(newXP.toFixed(2));
        });
      }, 6000) // 6000 ms = 0.1 sec
      setTimer(interval);
    }
  };

  const stopStudying = async () => {
    if (isStudying) {
      clearInterval(timer);
      setIsStudying(false);

      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }).start();

      const user = auth.currentUser;
      if (user) {
        const sessionDuration = Date.now() - (startTime || Date.now());
        const sessionMinutes = parseFloat((sessionDuration / 60000).toFixed(1)); // Convert ms to minutes

        if (sessionMinutes >= 0.1) {
          try {
            const totalXP = parseFloat((sessionMinutes * 10).toFixed(1)); // 10 XP per minute
            const playerDocRef = doc(db, 'leaderboard', user.uid);

            // Update Firestore with new minutesStudied, xp, and studySessions
            await updateDoc(playerDocRef, {
              minutesStudied: increment(sessionMinutes), // Add session minutes
              xp: increment(totalXP), // Add total XP earned during the session
              studySessions: arrayUnion(sessionMinutes.toFixed(1)), // Add session duration to sessions
            });

            console.log('Study session saved:', sessionMinutes, 'minutes,', totalXP, 'XP');
          } catch (error) {
            console.error('Error updating study session:', error);
          }
        }
      }

      setTimer(null);
      setStartTime(null);
    }
  };

  

  const triggerRankUpAnimation = () => {
    Animated.sequence([
      Animated.timing(rankAnimation, {
        toValue: 1.5,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(rankAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start()
  };

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
            { translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) },
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
            <Text style={styles.credit}>Account: {username}</Text>

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
            
            <View style={styles.rankSection}>
              <Animated.Image 
                source={require('../../assets/images/crownIcon.png')} 
                style={[styles.rankImage, 
                  {transform: [{scale: rankAnimation }] }, // scale animation
                ]}
              />
              <Text style={styles.rank}>RANK #{playerRank}</Text>
            </View>

            <Text style={styles.competitor}>COMPETITOR: {competitor}</Text>

            <Text style={styles.beatingCompetitorBy}>You are winning by {beatingCompetitorBy} minutes.</Text>
          </View>
          
      </ScrollView>
    </Animated.View>
    <Navbar activeTab="Home"/>
  </ImageBackground>
  );
}
      
const styles = StyleSheet.create({
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