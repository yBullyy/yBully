import { initializeApp } from 'firebase/app';
import { getDatabase, ref, child, get } from "firebase/database";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
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

console.log('background script here...')
