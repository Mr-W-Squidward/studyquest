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

  // On Username Update 
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

  // On Email Update
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

  // On Password Update
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

  // Set Reminder For Studying: Needs to be implemented
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
    Alert.alert("Feedback", "We appreciate your feedback! Email us at mrwsquidward@gmail.com");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Settings</Text>

        <View style={styles.row}>
          {/* LEFT SIDE */}
          <View style={styles.halfSection}>
            <Text style={styles.sectionHeader}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="New Username"
              placeholderTextColor="#CCC"
              value={newUsername}
              onChangeText={setNewUsername}
            />
            <TouchableOpacity style={styles.button} onPress={handleUsernameUpdate} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? "Updating..." : "Update Username"}</Text>
            </TouchableOpacity>
          </View>

          {/* RIGHT SIDE */}
          <View style={styles.halfSection}>
            <Text style={styles.sectionHeader}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="New Email"
              placeholderTextColor="#CCC"
              value={newEmail}
              onChangeText={setNewEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              placeholderTextColor="#CCC"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleEmailUpdate} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? "Updating..." : "Update Email"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.row}>
          {/* LEFT SIDE */}
          <View style={styles.halfSection}>
            <Text style={styles.sectionHeader}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor="#CCC"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              placeholderTextColor="#CCC"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handlePasswordUpdate} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? "Updating..." : "Update Password"}</Text>
            </TouchableOpacity>
          </View>

          {/* RIGHT SIDE */}
          <View style={styles.halfSection}>
            <Text style={styles.sectionHeader}>Study Reminder</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              placeholderTextColor="#CCC"
              value={reminderTime}
              onChangeText={setReminderTime}
            />
            <TouchableOpacity style={styles.button} onPress={setReminder}>
              <Text style={styles.buttonText}>Set Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>

      {/* Feedback */}
        <View style={styles.fullSection}>
          <TouchableOpacity style={styles.button} onPress={handleFeedback}>
            <Text style={styles.buttonText}>Send Feedback</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Navbar */}
      <View style={styles.navbarContainer}>
        <Navbar activeTab="Settings" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0E0E0E" },
  scrollContent: { paddingBottom: 150, paddingHorizontal: 20 },
  header: { fontSize: 28, color: "#FFF", textAlign: "center", marginVertical: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  halfSection: { width: "48%", backgroundColor: "#5e1214", padding: 40, borderRadius: 10 },
  fullSection: { width: "100%", backgroundColor: "#5e1214", padding: 40, borderRadius: 10 },
  sectionHeader: { fontSize: 18, color: "#FFF", marginBottom: 15 },
  input: { backgroundColor: "#FFF", borderRadius: 5, padding: 12, fontSize: 16, marginBottom: 15 },
  button: { backgroundColor: "#DF3131", borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  buttonText: { color: "#FFF", fontSize: 16, textAlign: 'center' },
  navbarContainer: { alignItems: "center", paddingBottom: 20 },
});