import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import firebase from "@/firebase.json";

initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
});

connectAuthEmulator(getAuth(), `http://127.0.0.1:${firebase.emulators.auth.port}`);

export { firebase };
