import React from 'react';
import { AuthProvider } from './context/AuthContext'; 
import AppStack from './navigation/AppStack'; 
import { StudySessionProvider } from './context/StudySessionContext';

export default function App() {
  return (
    <AuthProvider>
      <StudySessionProvider>
        <AppStack />
      </StudySessionProvider>
    </AuthProvider>
  );
}
