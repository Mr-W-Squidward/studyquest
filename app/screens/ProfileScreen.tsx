import React, { useEffect, useState} from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { auth, db } from "@/firebase/firebaseconfig";
import { doc, getDoc, collection, query, orderBy, getDocs, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState<string>('Anonymous');
  const [rank, setRank] = useState<number | string>("Unranked");
  const [totalStudyTime, setTotalStudyTime] = useState<number>(0);
  const [studySessions, setStudySessions] = useState<number>(0);
  const [averageStudyTime, setAverageStudyTime] = useState<number>(0);
  const [usersUnderCurrentRank, setUsersUnderCurrentRank] = useState<number>(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);

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

            const validStudySessions = Array.isArray(data.studySessions) ? data.studySessions.filter((session: number) => session > 0.1) : [];
            setStudySessions(validStudySessions.length);

            const totalValidTime = validStudySessions.reduce((sum: number, session: number) => sum + session, 0);
            const avgTime = validStudySessions.length > 0 ? (totalValidTime / validStudySessions.length).toFixed(2) : 0;
            setAverageStudyTime(Number(avgTime));

            setProfileImage(data.profileImage || null)
          }

          const leaderboardQuery = query(collection(db, 'leaderboard'), orderBy('xp', 'desc'));
          const leaderboardSnapshot = await getDocs(leaderboardQuery);

          let rankPos = 0;
          let totalUsers = 0;

          leaderboardSnapshot.forEach((docSnapshot, index) => {
            totalUsers++;
            if (docSnapshot.id === user.uid) {
              rankPos = index + 1;
            }
          });

          setRank(rankPos || "#Unranked");
          setUsersUnderCurrentRank(Math.max(0,  totalUsers-rankPos));
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
      alert("Permission to access photos is required.")
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
        setProfileImage(result.assets[0].uri);

        // update profile img in firestore
        const playerDocRef = doc(db, 'leaderboard', user.uid);
        await updateDoc(playerDocRef, {
          profileImage: result.assets[0].uri,
        })
      }

    }


  }

  return (
    <View style={styles.container}>
      <ImageBackground
                source={require('../../assets/images/homepagegradient.png')}
                style={styles.background}
      >
        <TouchableOpacity>
          <Image source={require('../../assets/images/shareIcon.png')} style={styles.shareButton}/>
        </TouchableOpacity>
        {/* Actual PROFILEEEEEEE Now */}
        <View style={styles.pfpContainer}>
          <Image source={require('../../assets/images/crownIcon.png')} style={styles.profileImage}/>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileText}>Username: {username}</Text>
          <Text style={[styles.profileText, styles.rank]}>Rank: #{rank}</Text>
          <Text style={styles.profileText}>Total Study Time: {totalStudyTime}</Text>
          <Text style={styles.profileText}>Study Sessions: {studySessions}</Text>
          <Text style={styles.profileText}>Average Study Session: {averageStudyTime.toFixed(2)} minutes</Text>
          <Text style={[styles.profileText, styles.usersUnderCurrentRank]}>You are currently beating {usersUnderCurrentRank} users</Text>
        </View>


      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
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
    height: 50,
    width: 50,
    borderRadius: 50,
    marginBottom: 20,
  },
  profileImage: {
    height: 200,
    width: 200,
  },
  rank: {
    color: '#FF5757',
  },
  usersUnderCurrentRank: {
    color: '#FF5757',
    marginTop: 20,
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