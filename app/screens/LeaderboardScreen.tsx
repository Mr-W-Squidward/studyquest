import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ImageBackground, ScrollView } from "react-native";
import { auth, db } from "@/firebase/firebaseconfig";
import Navbar from "../components/navbar";
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

interface Player {
  id: string;
  username: string;
  xp: number;
  isStudying: boolean;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isStudyingCount, setIsStudyingCount] = useState(0);
  const [userXP, setUserXP] = useState(0);

  useEffect(() => {
    // Fetch leaderboard data
    const fetchLeaderboardData = async () => {
      try {
        const leaderboardQuery = query(collection(db, 'leaderboard'), orderBy('xp', 'desc'))
        const leaderboardSnapshot = await getDocs(leaderboardQuery);

        let leaderboardData: any[] = [];
        let studyingCount = 0;

        leaderboardSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.isStudying) studyingCount++;
          leaderboardData.push({
            id: doc.id,
            username: data.username,
            xp: data.xp || 0,
            isStudying: data.isStudying || false,
          });
        });

        setLeaderboard(leaderboardData);
        setIsStudyingCount(studyingCount);

        const currentUser = leaderboardData.find((player) => player.id === auth.currentUser?.uid);
        if (currentUser) {
          setUserRank(leaderboardData.indexOf(currentUser)+1);
          setUserXP(currentUser.xp);
        }
      } catch (error) {
        console.error("There was an error fetching leaderboard data: ", error);
      }
    };

    fetchLeaderboardData();
  }, []);

  // XP needed between 2 players (used on Leaderboard)
  const getXPDifference = (playerXP: number) => {
    const difference = playerXP - userXP;
    if (difference > 0) return `+${difference} XP`;
    if (difference < 0) return `${difference} XP`;
    return 'TIED'
  };

  return (
    <ImageBackground source={require('../../assets/images/landinggradient.png')} style={styles.background}>
      <View style={styles.container}>
        <View style={styles.leaderboardContainer}>
          <Text style={styles.header}>Leaderboard</Text>
          
          <ScrollView>
            {leaderboard.map((player, index) => (
              <Text
                key={player.id}
                style={[
                  styles.playerText,
                  index === 0 && styles.topPlayerText,
                  index + 1 === userRank && styles.currentUserText,
                ]}
              >
                #{index + 1} - {player.username} [
                {index + 1 === userRank
                  ? `?? XP Needed`
                  : getXPDifference(player.xp)}
                ] {player.isStudying ? ", STUDYING!" : ""}
              </Text>
            ))}
          </ScrollView>


          <Text style={styles.studyingCount}>
            {isStudyingCount} People Studying Right Now
          </Text>

        </View>
      </View>
      <Navbar activeTab="Leaderboard"/>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardContainer: {
    backgroundColor: '#901919',
    borderRadius: 23,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontFamily: 'InriaSans-Regular',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  leaderboardContent: {
    width: "100%",
    alignItems: 'center',
  },
  defaultText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'LifeSavers-Regular',
    fontWeight: 'bold',
    marginVertical: 5,
  },
  highlightedText: {
    color: '#FFA500',
    fontSize: 16,
    fontFamily: 'LifeSavers-Regular',
    fontWeight: 'bold',
    marginVertical: 5,
  },
  playerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: 'LifeSavers-Regular',
    marginVertical: 5,
    textShadowColor: "000000",
    textShadowRadius: 3,
    textShadowOffset: { width: 1, height: 1 },
  },
  topPlayerText: {
    color: '#FF0000',
    fontSize: 16,
    fontFamily: 'LifeSavers-Regular',
    fontWeight: 'bold',
    marginVertical: 5,
  },
  separator: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  footerText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  currentUserText: {
    color: '#FFCF40',
    fontWeight: 'bold',
  },
  studyingCount: {
    color: "#FFFFFF",
    fontSize: 14,
    marginTop: 10,
    fontStyle: 'italic',
  },
})