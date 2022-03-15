import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup, getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import * as env from './env';

const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  databaseURL: env.FIREBASE_DATABASE_URL,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_APP_ID
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default getFirestore(app);

// const googleAuthProvider = new GoogleAuthProvider();

// chrome.runtime.onMessage.addListener((msg, sender, response) => {
//   if (msg.command === 'login') {
//     console.log("Login Initiated");
//     createUserWithEmailAndPassword(auth, 'test@aa.com', 'password').then((result) => {
//       let user = result.user;
//       response({ type: "auth", status: "success", message: user });
//     }).catch((error) => {
//       let errorMessage = error.message;
//       response({ type: "auth", status: "error", message: errorMessage });
//     });
//   }
// })

console.log('background script here...')
