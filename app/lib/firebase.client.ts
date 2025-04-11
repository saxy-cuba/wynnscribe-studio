import {initializeApp} from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";

const app = initializeApp({
    apiKey: import.meta.env.VITE_PUBLIC_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PUBLIC_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_PUBLIC_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_PUBLIC_FIREBASE_MEASUREMENT_ID,
})

const auth = getAuth(app)

setPersistence(auth, browserLocalPersistence)

export {auth}