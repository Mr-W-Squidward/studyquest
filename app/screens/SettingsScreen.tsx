import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { auth, db } from "../../firebase/firebaseconfig";
import {
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Navbar from "../components/navbar";

export default function Settings() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [username, setUsername] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "leaderboard", user.uid);
        const userDoc = await getDoc(docRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUsername(data.username || "");
          setEmail(user.email || "");
          setReminderTime(data.reminderTime || "");
        }
      }
    };
    fetchUserData();
  }, []);

  const handleUsernameUpdate = async () => {
    if (!newUsername.trim()) {
      Alert.alert("Error", "Please enter a username");
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "leaderboard", user.uid);
        await updateDoc(docRef, { username: newUsername });
        setUsername(newUsername);
        setNewUsername("");
        Alert.alert("Success", "Username updated successfully");
      }
    } catch (error) {
      console.error("Error updating username: ", error);
      Alert.alert("Error", "An error occurred while updating your username");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailUpdate = async () => {
    if (!newEmail.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill out all fields");
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
        await updateEmail(user, newEmail);
        setEmail(newEmail);
        setNewEmail("");
        setPassword("");
        Alert.alert("Success", "Email updated successfully");
      }
    } catch (error) {
      console.error("Error updating email: ", error);
      Alert.alert("Error", "An error occurred while updating your email");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!password.trim() || !newPassword.trim()) {
      Alert.alert("Error", "Please fill out all fields");
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        setPassword("");
        setNewPassword("");
        Alert.alert("Success", "Password updated successfully");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const setReminder = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "leaderboard", user.uid);
        await updateDoc(docRef, { reminderTime });
        Alert.alert("Success", `Reminder time updated successfully: ${reminderTime}`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to set reminder");
    }
  };

  const handleFeedback = () => {
    Alert.alert("Feedback", "We appreciate your feedback! Email us at feedback@example.com");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Settings</Text>
  
        {/* Username Update */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="New Username"
            placeholderTextColor="#555"
            value={newUsername}
            onChangeText={setNewUsername}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleUsernameUpdate}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Updating..." : "Update Username"}
            </Text>
          </TouchableOpacity>
        </View>
  
        {/* Email Update */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="New Email"
            placeholderTextColor="#555"
            value={newEmail}
            onChangeText={setNewEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            placeholderTextColor="#555"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleEmailUpdate}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Updating..." : "Update Email"}
            </Text>
          </TouchableOpacity>
        </View>
  
        {/* Password Update */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#555"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            placeholderTextColor="#555"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handlePasswordUpdate}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Updating..." : "Update Password"}
            </Text>
          </TouchableOpacity>
        </View>
  
        {/* Reminder Time */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Study Reminder</Text>
          <TextInput
            style={styles.input}
            placeholder="HH:MM"
            placeholderTextColor="#555"
            value={reminderTime}
            onChangeText={setReminderTime}
          />
          <TouchableOpacity style={styles.button} onPress={setReminder}>
            <Text style={styles.buttonText}>Set Reminder</Text>
          </TouchableOpacity>
        </View>
  
        {/* Feedback */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.button} onPress={handleFeedback}>
            <Text style={styles.buttonText}>Send Feedback</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Navbar activeTab="Settings" style={styles.navbar} />
    </View>
  );
}  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E0E0E",
  },
  scrollContent: {
    paddingBottom: 80, // Add space for the navbar
  },
  header: {
    fontSize: 28,
    fontFamily: "AnnieUseYourTelescope-Regular",
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 60,
    marginVertical: 20,
  },
  section: {
    marginVertical: 15,
    marginHorizontal: 15,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#1A1A1A",
  },
  sectionHeader: {
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
    color: "#000000",
  },
  button: {
    backgroundColor: "#DF3131",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  navbar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});