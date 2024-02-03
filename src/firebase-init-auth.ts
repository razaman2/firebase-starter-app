import {initializeApp} from "firebase/app";
import {connectAuthEmulator, getAuth} from "firebase/auth";
import {initializeAppCheck, ReCaptchaV3Provider} from "firebase/app-check";
import firebase from "@/firebase.json";

const app = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

if (import.meta.env.VITE_FIREBASE_APP_CHECK === "true") {
    initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY),
        isTokenAutoRefreshEnabled: true,
    });
}

if (import.meta.env.VITE_FIREBASE_EMULATORS === "true") {
    connectAuthEmulator(getAuth(), `http://127.0.0.1:${firebase.emulators.auth.port}`);
}

export {firebase};
