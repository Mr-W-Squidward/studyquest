import React, { createContext, useContext, useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import { auth, db } from '@/firebase/firebaseconfig';
import { doc, getDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';

interface StudySessionContextType {
  isStudying: boolean;
  minutesStudied: number;
  xp: number;
  startStudying: () => void;
  stopStudying: () => void;
}

const StudySessionContext = createContext<StudySessionContextType | undefined>(undefined);

export const StudySessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isStudying, setIsStudying] = useState(false);
  const [minutesStudied, setMinutesStudied] = useState(0);
  const [xp, setXP] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Fetch previous session state from Firestore
  useEffect(() => {
    const fetchStudySession = async () => {
      const user = auth.currentUser;
      if (user) {
        const playerDoc = await getDoc(doc(db, 'leaderboard', user.uid));
        if (playerDoc.exists()) {
          const data = playerDoc.data();
          setIsStudying(data.isStudying || false);
          setMinutesStudied(data.minutesStudied || 0);
          setXP(parseFloat((data.xp || 0).toFixed(1)));
          setStartTime(data.isStudying ? Date.now() - (data.studyDuration || 0) : null);
        }
      }
    };
    fetchStudySession();
  }, []);

  // Sound effect function
  interface SoundFile {
    uri: string;
  }

  const playSound = async (soundFile: SoundFile): Promise<void> => {
    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
  };

  // Start studying
  const startStudying = async () => {
    if (!isStudying) {
      await playSound(require('../../assets/sounds/start.wav'));
      setIsStudying(true);
      setStartTime(Date.now());

      const interval = setInterval(() => {
        setMinutesStudied((prev) => prev + 0.1);
        setXP((prev) => prev + 1);
      }, 6000); // Increment every 6 seconds (0.1 min)

      setTimer(interval);

      const user = auth.currentUser;
      if (user) {
        const playerDocRef = doc(db, 'leaderboard', user.uid);
        await updateDoc(playerDocRef, {
          isStudying: true,
          studyStartTime: Date.now(),
        });
      }
    }
  };

  // Stop studying
  const stopStudying = async () => {
    if (isStudying) {
      if (timer) {
        clearInterval(timer);
      }
      setIsStudying(false);
      setTimer(null);

      const sessionDuration = startTime ? (Date.now() - startTime) / 60000 : 0;
      const totalXP = sessionDuration * 10;

      const roundedMinutes = parseFloat(sessionDuration.toFixed(1));
      const roundedXP = parseFloat(totalXP.toFixed(1));

      if (roundedMinutes >= 0.1) {
        setMinutesStudied((prev) => parseFloat((prev + roundedMinutes).toFixed(1)));
        setXP((prev) => parseFloat((prev + roundedXP).toFixed(1)));

        const user = auth.currentUser;
        if (user) {
          const playerDocRef = doc(db, 'leaderboard', user.uid);
          await updateDoc(playerDocRef, {
            isStudying: false,
            minutesStudied: increment(roundedMinutes),
            xp: increment(roundedXP),
            studySessions: arrayUnion(roundedMinutes.toFixed(1)),
          });
        }
      }
    }
  };

  return (
    <StudySessionContext.Provider value={{ isStudying, minutesStudied, xp, startStudying, stopStudying }}>
      {children}
    </StudySessionContext.Provider>
  );
};

export const useStudySession = () => {
  const context = useContext(StudySessionContext);
  if (!context) {
    throw new Error("useStudySession must be used within a StudySessionProvider");
  }
  return context;
};
