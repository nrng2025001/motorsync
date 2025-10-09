import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCY3Iw35gcZhVrG3ZUH2B3I2LHoVBwkALE",
  authDomain: "car-dealership-app-9f2d5.firebaseapp.com",
  projectId: "car-dealership-app-9f2d5",
  storageBucket: "car-dealership-app-9f2d5.firebasestorage.app",
  messagingSenderId: "768479850678",
  appId: "1:768479850678:web:e994d17c08dbe8cab87617"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
