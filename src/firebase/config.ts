// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";



// import { getAnalytics } from "firebase/analytics";



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB50wTQ9WR3VdgOnn9agTPXTsWstm88rKY",
    authDomain: "nrjl-system.firebaseapp.com",
    projectId: "nrjl-system",
    storageBucket: "nrjl-system.firebasestorage.app",
    messagingSenderId: "96367195723",
    appId: "1:96367195723:web:e9560b38dbd2b3332f7fce",
    measurementId: "G-NYBRV51K6Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// const analytics = getAnalytics(app);



export const auth = getAuth(app);
export const db = getFirestore(app);