import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Navbar = ({ activeTab }) => {
  const navigation = useNavigation();

  const tabs = [
    { name: 'Home', route: 'Home' },
    { name: 'Profile', route: 'Profile' },
    { name: 'Challenges', route: 'Challenges' },
    { name: 'Leaderboard', route: 'Leaderboard' },
    { name: 'Settings', route: 'Settings' },
  ];

  return (
    <View style={styles.navbarContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.route}
          style={[
            styles.navbarCategories,
            activeTab === tab.name && { backgroundColor: '#DF3131' },
          ]}
          onPress={() => navigation.navigate(tab.route)}
        >
          <Text style={styles.navbarText}>{tab.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  navbarContainer: {
    position: 'absolute',
    bottom: 0, 
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 30,
  },
  navbarCategories: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 8,
  },
  navbarText: {
    fontFamily: "AnnieUseYourTelescope-Regular",
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default Navbar;
