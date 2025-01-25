import React, { useEffect, useRef, useState} from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground, Alert, Dimensions } from "react-native";
import { auth, db } from "@/firebase/firebaseconfig";
import { doc, getDoc, collection, query, orderBy, getDocs, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import Navbar from "../components/navbar";
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing'

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const [username, setUsername] = useState<string>('Anonymous');
  const [rank, setRank] = useState<number | string>("Unranked");
  const [totalStudyTime, setTotalStudyTime] = useState<number>(0);
  const [studySessions, setStudySessions] = useState<number>(0);
  const [usersUnderCurrentRank, setUsersUnderCurrentRank] = useState<number>(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const viewShotRef = useRef(null);

  useEffect(() => {
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

            const totalValidTime = data.studySessions.length > 0 ? data.studySessions.reduce((sum: number, session: number) => sum + session, 0) : 0;

            setProfileImage(data.profileImage || null)
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
})