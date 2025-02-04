import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import AuthScreen from '../screens/AuthScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import Leaderboard from '../screens/LeaderboardScreen';
import Settings from '../screens/SettingsScreen';

const Stack = createStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen}/>
      <Stack.Screen name="Challenges" component={ChallengesScreen}/>
      <Stack.Screen name="Leaderboard" component={Leaderboard}/>
      <Stack.Screen name="Settings" component={Settings}/>
    </Stack.Navigator>
  );
}
