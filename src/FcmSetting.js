import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyBpdlq-DbySQZcB6SQevQRaphU_88KYICQ",
    authDomain: "lck-crawling-project.firebaseapp.com",
    projectId: "lck-crawling-project",
    storageBucket: "lck-crawling-project.firebasestorage.app",
    messagingSenderId: "14875322191",
    appId: "1:14875322191:web:4369541a2118987c27c73a",
    measurementId: "G-11ML6V2RWF"
  };

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);