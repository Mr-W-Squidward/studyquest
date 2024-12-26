import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyApelkWvdwKa5kkxn7rEwXiKBJST8VxZvQ',
  projectId: 'studyquest-6090c',
  storageBucket: 'studyquest-6090c.firebasestorage.app',
  appId: '1:109102804456:ios:ed33f5b9d857762a60085d',
};

// Initialize Firebase
console.log("Initializing Firebase...");
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
