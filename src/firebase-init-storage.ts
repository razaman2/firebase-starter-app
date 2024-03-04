import {firebase} from "./firebase-init-auth";
import {connectStorageEmulator, getStorage} from "firebase/storage";

if (import.meta.env.VITE_FIREBASE_EMULATORS === "true") {
    connectStorageEmulator(getStorage(), "127.0.0.1", firebase.emulators.storage.port);
}
