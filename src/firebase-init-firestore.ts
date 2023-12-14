import {firebase} from "./firebase-init-auth";
import {connectFirestoreEmulator, collection, collectionGroup, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, deleteField, getFirestore, arrayUnion, serverTimestamp, onSnapshot, writeBatch} from "firebase/firestore";
import {Collection} from "@razaman2/firestore-proxy";

connectFirestoreEmulator(getFirestore(), "127.0.0.1", firebase.emulators.firestore.port);

Collection.proxy({
    logging: true,
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
    deleteField,
    arrayUnion,
    serverTimestamp,
    onSnapshot,
    writeBatch,
});

Collection.proxy().getDocuments()
