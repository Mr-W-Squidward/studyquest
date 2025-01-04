import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, ImageBackground, StyleSheet, Alert } from "react-native";
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

export default function ChallengesScreen() {
  const [challenges, setChallenges] = useState(challengesData);
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [xpGained, setXpGained] = useState(0);

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
  }, []);

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
        <Text style={styles.header}>SPENDABLE: {remainingMinutes} MINUTES</Text>
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
                  { width: `${(remainingMinutes / 120) * 100}%` },
                ]}
              />
            </View>
          </View>

          <Text style={styles.quote}>
            "Work hard, study well, and eat and sleep plenty. That is the Turtle Hermit Way!"
          </Text>
          <Text style={styles.quoteAuthor}>- Master Roshi</Text>
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
  },
  progress: {
    height: "100%",
    backgroundColor: "#00FF00",
    borderRadius: 4,
  },
  quote: {
    color: "#FFFFFF",
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
  quoteAuthor: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5,
  },
});
