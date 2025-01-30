import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Image, ImageBackground, StyleSheet, Alert, Animated } from "react-native";
import Navbar from "../components/navbar";
import { updateDoc, increment, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseconfig";

const challengesData = [
  { id: 1, minutes: 20, xp: 10, completed: false },
  { id: 2, minutes: 30, xp: 40, completed: false },
  { id: 3, minutes: 60, xp: 100, completed: false },
  { id: 4, minutes: 90, xp: 120, completed: false },
  { id: 5, minutes: 120, xp: 150, completed: false },
];

const quotes = [
  { text: "Nobody can go back and start a new beginning, but anyone can start today and make a new ending.", author: "Maria Robinson" },
  { text: "Many of life's failures are people who did not realise how close they were to success when they gave up.", author: "Thomas Edison" },
  { text: "Success is not final, failure is not fatal; it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "If your dreams don't scare you, they aren't big enough.", author: "Muhammad Ali" },
  { text: "The thing about motivated people chasing their dream is they look crazy to lazy people.", author: "Albert Einstein" },
  { text: "If you can imagine it, you can achieve it. If you can dream it, you can become it.", author: "William Arthur Ward" },
  { text: "So many of our dreams at first seem impossible, then they seem improbable, and then, when we summon the will, they soon become inevitable.", author: "Christopher Reeve" },
  { text: "The people who are crazy enough to believe they can change the world are the ones who do.", author: "Steve Jobs" },
  { text: "You don't learn to walk by following rules. You learn by doing, and by falling over.", author: "Richard Branson" },
  { text: "A life spent making mistakes is not only more honorable, but more useful than a life spent doing nothing.", author: "George Bernard Shaw" },
  { text: "Insanity is doing the same thing over and over again, but expecting different results.", author: "Albert Einstein" },
  { text: "It's not because things are difficult that we do not dare. It is because we do not dare that they are difficult.", author: "Seneca" },
  { text: "Our greatest glory is not in never failing, but in rising every time we fail.", author: "Confucius" },
  { text: "Discovery consists of seeing what everybody has seen and thinking what nobody has thought.", author: "Albert Szent-Gyorgyi" },
  { text: "The greatest enemy of knowledge is not ignorance, it is the illusion of knowledge.", author: "Stephen Hawking" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "Studying for 1 hour is less than 5% of your day. You can make it through 60 minutes.", author: "Alexandra Markin" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Studying is hard. Not having the life you want is hard. Choose your hard.", author: "Alexandra Markin" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "Opportunities are usually disguised as hard work, so most people don't recognize them.", author: "Ann Landers" },
  { text: "A lot of hard work is hidden behind nice things.", author: "Ralph Lauren" },
  { text: "Skill is only developed by hours and hours of work.", author: "Usain Bolt" },
  { text: "Some people dream of success, while others wake up and work hard at it.", author: "Napoleon Hill" },
  { text: "If you have goals and procrastination, you have nothing. If you have goals and you take action, you will have anything you want.", author: "Thomas J. Vilord" },
  { text: "It isn't the mountains ahead that wear you down. It's the pebble in your shoe.", author: "Muhammad Ali" },
];

export default function ChallengesScreen() {
  const [challenges, setChallenges] = useState(challengesData);
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchPlayerData = async () => {
      const user = auth.currentUser;
      if (user) {
        const playerDocRef = doc(db, "leaderboard", user.uid);
        const playerDoc = await getDoc(playerDocRef);

        if (playerDoc.exists()) {
          const data = playerDoc.data();
          console.log("Player data: ", data);
          setRemainingMinutes(data?.remainingMinutes || 0);
        }
      }
    };

    fetchPlayerData();
    resetChallenges();
    startQuoteCycle();
  }, []);

  // Cycling quotes
  const startQuoteCycle = () => {
    fadeIn();
    const interval = setInterval(() => {
      fadeOut(() => {
        setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
        fadeIn();
      });
    }, 10000);
    return () => clearInterval(interval);
  };

  // Animations 
  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = (callback: any) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      if (callback) callback();
    });
  };

  const resetChallenges = () => {
    setChallenges(challengesData.map((challenge) => ({ ...challenge, completed: false })));
    setXpGained(0);
  };

  const handleCompleteChallenge = async (challenge: { id: number; minutes: number; xp: number; completed: boolean }) => {
    console.log("Clicked Challenge: ", challenge);
    console.log("Remaining Minutes: ", remainingMinutes);
    if (remainingMinutes >= challenge.minutes && !challenge.completed) {

      const updatedChallenges = challenges.map((ch) =>
        ch.id === challenge.id ? { ...ch, completed: true } : ch
      );

      setChallenges(updatedChallenges);

      const user = auth.currentUser;
      if (user) {
        const playerDocRef = doc(db, "leaderboard", user.uid);

        try {
          await updateDoc(playerDocRef, {
            xp: increment(challenge.xp),
            remainingMinutes: increment(-challenge.minutes),
          });

          setRemainingMinutes((prev) => prev - challenge.minutes);
          setXpGained((prev) => prev + challenge.xp);

          Alert.alert("Challenge completed!", `You gained ${challenge.xp} XP!`);
        } catch (error) {
          console.error("Error updating Firestore: ", error);
          Alert.alert("Error", "Failed to Update The Challenge. Please Try Again.");
        }
      }
    } else if (challenge.completed) {
      Alert.alert("You already earned XP for this challenge!");
    } else {
      Alert.alert(
        "Not enough minutes!",
        `You need at least ${challenge.minutes} minutes to complete this challenge.`
      );
    }
  };

  return (
    <ImageBackground source={require("../../assets/images/landinggradient.png")} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.header}>SPENDABLE: {parseFloat(remainingMinutes.toFixed(1))} MINUTES</Text>
        <View style={styles.challengesContainer}>
          <Text style={styles.header}>Challenges</Text>

          {challenges.map((challenge) => (
            <View key={challenge.id} style={styles.challengeRow}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  challenge.completed && styles.checkboxCompleted,
                ]}
                onPress={() => handleCompleteChallenge(challenge)}
              />

              <Text style={styles.challengeText}>{challenge.minutes} Minutes Logged</Text>
              <Text style={styles.challengeXP}>+{challenge.xp} XP</Text>
            </View>
          ))}

          <View style={styles.nextMilestoneContainer}>
            <Text style={styles.nextMilestone}>NEXT MILESTONE</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progress,
                  {
                    width: `${
                      remainingMinutes >= 120
                        ? 100
                        : (remainingMinutes / 120) * 100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>

          {/* Animated Quotes */}
          <Animated.View style={[styles.quoteContainer, { opacity: fadeAnim }]}>
            <Text style={styles.quote} numberOfLines={2} ellipsizeMode="tail">"{quotes[currentQuoteIndex].text}"</Text>
            <Text style={styles.quoteAuthor}>-- {quotes[currentQuoteIndex].author}</Text>
          </Animated.View>
        </View>
      </View>

      <Navbar activeTab="Challenges" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  quoteContainer: {
    height: 80,
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  challengesContainer: {
    backgroundColor: "#901919",
    borderRadius: 23,
    padding: 20,
    width: "90%",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontFamily: "InriaSans-Regular",
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  challengeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 4,
    marginRight: 10,
  },
  checkboxCompleted: {
    backgroundColor: "#00FF00",
    borderColor: "#00FF00",
  },
  challengeText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
  },
  challengeXP: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "LifeSavers-Regular",
  },
  nextMilestoneContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  nextMilestone: {
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 5,
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    overflow: "hidden",
    flexDirection: "row",
  },
  progress: {
    height: "100%",
    backgroundColor: "#00FF00",
    borderRadius: 4,
  },
  quote: {
    color: "#FFFFFF",
    fontSize: 11,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 10,
  },
  quoteAuthor: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5,
  },
});
