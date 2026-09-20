import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult
} from "firebase/auth";
import { 
    getFirestore,
    updateDoc, 
    doc, 
    getDoc, 
    setDoc,
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    onSnapshot, 
    serverTimestamp 
} from "firebase/firestore";
import { 
    getStorage, 
    ref, 
    uploadBytesResumable, 
    getDownloadURL, 
    deleteObject 
} from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyC852meQNH59LkphjL6LiCfP3W42bDJ6R8",
    authDomain: "alpha-c3c01.firebaseapp.com",
    databaseURL: "https://alpha-c3c01-default-rtdb.firebaseio.com",
    projectId: "alpha-c3c01",
    storageBucket: "alpha-c3c01.firebasestorage.app",
    messagingSenderId: "151775555113",
    appId: "1:151775555113:web:052ad410823eaaf93df638",
    measurementId: "G-G64EQRPQHP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
storage.maxUploadRetryTime = 30000;

// Define the exact two authorized Admin UIDs here once obtained
export const ADMIN_UIDS = ["fMGIdEIX9YcpqTYS9LswRMcFSIb2", "jIf44hCNk6heym0SI0dGRUhIs7G2"];

// Setup reference email (used for informational display only)
export const DEDICATED_ADMIN_EMAIL = "mpari1485@gmail.com";

/**
 * Validates if the authenticated user is an authorized admin.
 * Fails closed if the UID doesn't match our strict allowlist.
 */
export function isUserAdmin(user) {
    if (!user || !user.uid) return false;
    return ADMIN_UIDS.includes(user.uid);
}

export {
    updateDoc,
    app,
    auth,
    db,
    storage,
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    doc,
    getDoc,
    setDoc,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject
};
