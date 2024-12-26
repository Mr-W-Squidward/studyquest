import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext'; 
import AuthScreen from './navigation/AuthScreen'; 

export default function App() {
  return (
    <AuthProvider>
      <AuthScreen />
    </AuthProvider>
  );
}
