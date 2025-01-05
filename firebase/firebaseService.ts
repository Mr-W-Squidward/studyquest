import { doc, setDoc, updateDoc, increment, collection, query, orderBy, getDocs, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseconfig';
import { getAuth, updateProfile } from 'firebase/auth';

export interface Player {
  id: string,
  username: string;
  xp: number;
  remainingMinutes: number,
  minutesStudied: number,
  studySessions: number,
  isStudying: boolean,
}

// adding a player
export const addPlayer = async (): Promise<void> => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error("No logged in user!");
    return;
  }

  try {
    const playerRef = doc(db, 'leaderboard', user.uid);
    const playerDoc = await getDoc(playerRef);

    if (!playerDoc.exists()) {
      await setDoc(playerRef, {
        username: user.displayName || null, // Leave as null for now
        xp: 0, // default
        remainingMinutes: 0,
        minutesStudied: 0,
        studySessions: 0,
        level: 0,
        isStudying: false,
      });
      console.log('Player added to leaderboard');
    } else {
      console.log('Player already exists, not adding to leaderboard');
    }
  } catch (error) {
    console.error('Error adding player: ', error);
  }
};


// updating XP dynamically
export const updatePlayerXP = async (xpToAdd: number, minutesToAdd: number, newStudySessions: number): Promise<void> => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error("No logged in user!");
    return;
  }

  try {
    const playerDocRef = doc(db, 'leaderboard', user.uid);
    await updateDoc(playerDocRef, {
      xp: increment(xpToAdd),
      minutesStudied: increment(minutesToAdd),
      studySessions: newStudySessions,
    });

    console.log(`XP/Minutes Studied Updated for user: ${user.uid}`);
  } catch (error) {
    console.error("Error updating player XP/Minutes Studied: ", error)
  }
};

// updating XP
export const fetchLeaderboard = async (): Promise<Player[]> => {
  try {
    const q = query(collection(db, 'leaderboard'), orderBy("xp", "desc"));
    const querySnapshot = await getDocs(q);

    const leaderboard: Player[] = [];
    querySnapshot.forEach((doc) => {
      leaderboard.push({ id: doc.id, ...(doc.data() as Player) });
    });

    return leaderboard;
  } catch (error) {
    console.error("Error fetching leaderboard: ", error)
    return [];
  }
};

// subscribing to leaderboard for real-time updates
export const subscribeToLeaderboard = (
  setLeaderboard: (leaderboard: Player[]) => void
): (() => void) => {
  const q = query(collection(db, 'leaderboard'), orderBy("xp", "desc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const leaderboard: Player[] = [];
    snapshot.forEach((doc) => {
      leaderboard.push({ id: doc.id, ...(doc.data() as Player) });
    });
    setLeaderboard(leaderboard);
  });

  return unsubscribe;
};