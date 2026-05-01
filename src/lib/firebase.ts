import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBw21dQiW7IHHa1rRY8x50oe1ivzLO8Fbc",
  authDomain: "anotadev.firebaseapp.com",
  projectId: "anotadev",
  storageBucket: "anotadev.firebasestorage.app",
  messagingSenderId: "1045418495881",
  appId: "1:1045418495881:web:a9377a8ee2bd4b3bce1b58",
  measurementId: "G-BCWM6JVJN0"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export default app
