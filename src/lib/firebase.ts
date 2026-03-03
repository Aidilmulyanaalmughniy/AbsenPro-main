import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyALYqCF1OY1z6wA5n6UQ8jpcDKnxYagKM0",

authDomain: "absensipro-dcb68.firebaseapp.com",

projectId: "absensipro-dcb68",

storageBucket: "absensipro-dcb68.firebasestorage.app",

messagingSenderId: "1026826298062",

appId: "1:1026826298062:web:40170ecfeb67f3a6c6a69f"
};

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)