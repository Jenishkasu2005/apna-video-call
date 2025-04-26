// Firebase configuration file
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyASSvDOEBGFK98txc9YXgFDTW7GLjgMXR8",
  authDomain: "food-delivery-ad021.web.app",
  projectId: "food-delivery-ad021",
  storageBucket: "food-delivery-ad021.appspot.com",
  messagingSenderId: "853467028209",
  appId: "1:853467028209:android:722d2a3320b0e87c3f2750",
  // Enable CORS for video storage
  storageCorsOptions: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
const storage = getStorage(app);

export { storage };