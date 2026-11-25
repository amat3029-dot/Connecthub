import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBNR3ro6aa3Sr1LxOFuejz1ck9Od-e-9D4",
  authDomain: "connecthub-59fe3.firebaseapp.com",
  projectId: "connecthub-59fe3",
  storageBucket: "connecthub-59fe3.firebasestorage.app",
  messagingSenderId: "182819846328",
  appId: "1:182819846328:web:2ae1b9c127d4a854a31c4d",
  measurementId: "G-TQDXPHP43Q"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);