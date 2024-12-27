import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyApelkWvdwKa5kkxn7rEwXiKBJST8VxZvQ',
  authDomain: 'studyquest-6090c.firebaseapp.com',
  projectId: 'studyquest-6090c',
  storageBucket: 'studyquest-6090c.appspot.com',
  messagingSenderId: '109102804456',
  appId: '1:109102804456:ios:ed33f5b9d857762a60085d',
};

// Ensure Firebase is only initialized once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { auth };
