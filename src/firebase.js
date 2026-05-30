// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // 🔥 FOI ESTA A IMPORTAÇÃO QUE FALTOU!

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpD5QjeRK-dWm8DVzOy9RchtgsUSY1E3U",
  authDomain: "srv-d80g2nrbc2fs73f37rf0.firebaseapp.com",
  projectId: "srv-d80g2nrbc2fs73f37rf0",
  storageBucket: "srv-d80g2nrbc2fs73f37rf0.firebasestorage.app",
  messagingSenderId: "744895586120",
  appId: "1:744895586120:web:d5d65bcae81b6fefd01d7d",
  measurementId: "G-B8QJMKD9S0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Exporta a ligação do banco de dados para o app.jsx poder usar
export const db = getFirestore(app);