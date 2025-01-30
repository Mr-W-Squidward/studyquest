import React from 'react';
import { AuthProvider } from './context/AuthContext'; 
import AppStack from './navigation/AppStack'; 
import { StudySessionProvider } from './context/StudySessionContext';

export default function App() {
  return (
    // Auth context provider wraps the StudySessionProvider which wraps the AppStack
    <AuthProvider>
      <StudySessionProvider>
        <AppStack />
      </StudySessionProvider>
    </AuthProvider>
  );
}
