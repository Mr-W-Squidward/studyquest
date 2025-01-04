import React from 'react';
import { AuthProvider } from './context/AuthContext'; 
import AppStack from './navigation/AppStack'; 

export default function App() {
  return (
    <AuthProvider>
      <AppStack />
    </AuthProvider>
  );
}
