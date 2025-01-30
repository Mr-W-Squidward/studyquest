import React, { useEffect, useRef, useState} from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground, Alert, Dimensions, Modal } from "react-native";
import { auth, db } from "@/firebase/firebaseconfig";
import { doc, getDoc, collection, query, orderBy, getDocs, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import Navbar from "../components/navbar";
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing'
import { FlatList } from "react-native-gesture-handler";

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  requirement: number | string;
}

const achievementList = [
  { id: 1, name: "Beginner Scholar", description: "Study for 10 minutes", icon: "📖", requirement: 10},
  { id: 2, name: "Leader", description: "Study for 100 minutes", icon: "📚", requirement: 100},
  { id: 3, name: "Study Warrior", description: "Study for 500 minutes", icon: "🔥", requirement: 500},
  { id: 4, name: "Study Champion", description: "Study for 1000 minutes", icon: "🏅", requirement: 1000},
  { id: 5, name: "Unstoppable", description: "Study for 5000 minutes", icon: "🏆", requirement: 5000},
  { id: 6, name: "Night Owl", description: "Study between 12AM - 4AM", icon: "🌙", requirement: "night"},
  { id: 7, name: "Marathon Runner", description: "Study for 3+ hours in one consecutive session", icon: "⏳", requirement: "long-session"},
  { id: 8, name: "Daily Grinder", description: "Study for 7 consecutive days", icon: "📅", requirement: "streak"},
  { id: 8, name: "Among The Greatest", description: "Hit top 10 in the leaderboard", icon: "🎖", requirement: "top10"}
]

export default function ProfileScreen() {
  const [username, setUsername] = useState<string>('Anonymous');
  const [rank, setRank] = useState<number | string>("Unranked");
  const [totalStudyTime, setTotalStudyTime] = useState<number>(0);
  const [studySessions, setStudySessions] = useState<number>(0);
  const [usersUnderCurrentRank, setUsersUnderCurrentRank] = useState<number>(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const viewShotRef = useRef(null);

  useEffect(() => {
    // Fetch Firebase Leaderboard Data
    const fetchData = async () => {
      const user = auth.currentUser;

      if (user) {
        try {
          const playerDoc = await getDoc(doc(db, 'leaderboard', user.uid));
          if (playerDoc.exists()) {
            const data = playerDoc.data();
            setUsername(data.username || 'ANONYMOUS');
            setTotalStudyTime(data.minutesStudied || 0);
            setStudySessions(data.studySessions.length);
            setProfileImage(data.profileImage || null)

            let earnedAchievements = achievementList.filter(achievement => {
              if (typeof achievement.requirement === "number") {
                return data.minutesStudied >= achievement.requirement;
              }
              if (achievement.requirement === "night") {
                return data.nightSessions > 0;
              }
              if (achievement.requirement === "long-session") {
                return data.longestSession >= 180;
              }
              if (achievement.requirement === "streak") {
                return data.studyStreak >= 7;
              }
              if (achievement.requirement === "top10") {
                return data.rank <= 10;
              }
              return false;
            });

            setAchievements(earnedAchievements);
          }

          const leaderboardQuery = query(collection(db, 'leaderboard'), orderBy('xp', 'desc'));
          const leaderboardSnapshot = await getDocs(leaderboardQuery);

          let rankPos = 0;
          let totalUsers = 0;
          let index = 0;

          leaderboardSnapshot.forEach((docSnapshot) => {
            totalUsers++;

            if (docSnapshot.id === user.uid) {
              rankPos = index + 1;
            }
            index++;
          });

          setRank(rankPos || "Unranked");
          setUsersUnderCurrentRank(totalUsers-rankPos);
        } catch (error) {
          console.error('Error fetching profile data: ', error)
        }
      }
    };

    fetchData();
  }, []);

  // Image picker for PFP selection 
  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission to access photos is required.")
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const user = auth.currentUser;
      if (user) {
        const selectedImage = result.assets[0].uri;
        setProfileImage(selectedImage);

        // update profile img in firestore
        const playerDocRef = doc(db, 'leaderboard', user.uid);
        try {
          await updateDoc(playerDocRef, {
            profileImage: result.assets[0].uri,
          });
          Alert.alert("Profile Picture Successfully Updated!")
        } catch (error) {
          console.error("Error updating profile picture: ", error)
        }
      } 
    }
  }

  // Only works on mobile (viewShotRef doesn't apply to PC screens) sharing stat image
  const handleShare = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      if (uri) {
        const isSharingAvailable = await Sharing.isAvailableAsync();  
        if (isSharingAvailable) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert("Sharing is not available :(")
        }
      }
    } catch (error) {
      console.error("Error sharing profile screenshot: ", error);
    }
  }

  return (
    <ViewShot ref={viewShotRef} style={{ flex: 1 }} options={{ format: "jpg", quality: 1.0 }}>
      <View style={styles.container}>
        <ImageBackground
          source={require("../../assets/images/homepagegradient.png")}
          style={styles.background}
        >
        <TouchableOpacity onPress={handleShare}>
          <Image source={require("../../assets/images/shareIcon.png")} style={styles.shareButton} />
        </TouchableOpacity>

        {/* PROFILE CONTENT */}
        <View style={styles.pfpContainer}>
          <TouchableOpacity onPress={handleImagePicker}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <Image source={require("../../assets/images/anonymous.png")} style={styles.profileImage} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileText}>Username: {username}</Text>
          <Text style={[styles.profileText, styles.rank]}>Rank: #{rank}</Text>
          <Text style={styles.profileText}>
            Total Study Time: {totalStudyTime.toFixed(2)} Minutes
          </Text>
          <Text style={styles.profileText}>Study Sessions: {studySessions || 0}</Text>
          <Text style={styles.profileText}>
            Average Study Session:{" "}
            {studySessions > 0 ? (totalStudyTime / studySessions).toFixed(2) : 0} minutes
          </Text>
          <Text style={[styles.profileText, styles.usersUnderCurrentRank]}>
            You are currently beating {usersUnderCurrentRank}{" "}
            {usersUnderCurrentRank === 1 ? "user" : "users"}
          </Text>
        </View>

        {/* ACHIEVEMENTS */}
        <Text style={styles.achievementsTitle}>Achievements</Text>
        <View style={styles.achievementContainer}>
          <FlatList 
            data={achievements}
            numColumns={3}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{
              justifyContent: 'center', 
              alignItems: 'center',
            }}
            renderItem={({item}) => (
              <TouchableOpacity onPress={() => { setSelectedAchievement(item); setModalVisible(true); }}>
                <Text style={styles.achievementIcon}>{item.icon}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* ACHIEVEMENT MODAL */}
        {selectedAchievement && (
          <Modal transparent visible={modalVisible} animationType="slide">
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>{selectedAchievement.name}</Text>
              <Text>{selectedAchievement.description}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        )}

        <Image source={require("../../assets/images/profilegraphic.png")} style={styles.profileGraphic} />
        </ImageBackground>
      <Navbar activeTab="Profile" />
    </View>
  </ViewShot>
  )
}

const styles = StyleSheet.create({
  viewShot: {
    backgroundColor: 'transparent',
  },
  separator: {
    color: "#FFFFFF",
    fontSize: 16,
    opacity: 0.5,
    marginBottom: 20,
  },
  profileGraphic: {
    width: 200,
    height: 200,
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#682860'
  },
  pfpContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  background: {
    width: '100%',
    flex: 1,
  },
  shareButton: {
    top: 40,
    height: 50,
    width: 50,
    borderRadius: 50,
    marginBottom: 20,
  },
  profileImage: {
    height: 200,
    width: 200,
    borderRadius: 100,
    margin: 10,
    marginBottom: 20,
  },
  rank: {
    color: '#FF5757',
  },
  usersUnderCurrentRank: {
    color: '#FF5757',
    marginTop: 40,
  },
  profileInfo: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 20,
    color: '#FF0000',
    fontFamily: 'AnnieUseYourTelescope-Regular',
    textShadowColor: '#000000',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 3,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#682860",
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  achievementContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  achievementIcon: {
    fontSize: 40,
    margin: 10,
    padding: 15,
    backgroundColor: '#2D2D2D',
    borderRadius: 10,
    textAlign: 'center',
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  modalView: {
    backgroundColor: "#222",
    borderRadius: 20, 
    padding: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
    alignSelf: 'center',
    marginTop: '50%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  modalClose: {
    fontSize: 18,
    color: "#FF5757",
    fontWeight: 'bold',
    marginTop: 15,
  },
})