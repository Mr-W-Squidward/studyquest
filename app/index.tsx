import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext'; 
import AppStack from './navigation/AppStack'; 

export default function App() {
  return (
    <AuthProvider>
      <AppStack />
    </AuthProvider>
  );
}
