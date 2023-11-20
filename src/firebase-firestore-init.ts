import {firebase} from "./firebase-auth-init.ts";
import {connectFirestoreEmulator, collection, collectionGroup, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, getFirestore, arrayUnion, serverTimestamp, onSnapshot, writeBatch} from "firebase/firestore";
import {Collection} from "@razaman2/firestore-proxy";

connectFirestoreEmulator(getFirestore(), "127.0.0.1", firebase.emulators.firestore.port);

Collection.proxy({
    logging: false,
    modular: true,
    getFirestore: getFirestore(),
    collection,
    collectionGroup,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    arrayUnion,
    serverTimestamp,
    onSnapshot,
    writeBatch,
});
