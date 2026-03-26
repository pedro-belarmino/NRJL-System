import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Using the config from the project
const firebaseConfig = {
    apiKey: "AIzaSyB50wTQ9WR3VdgOnn9agTPXTsWstm88rKY",
    authDomain: "nrjl-system.firebaseapp.com",
    projectId: "nrjl-system",
    storageBucket: "nrjl-system.firebasestorage.app",
    messagingSenderId: "96367195723",
    appId: "1:96367195723:web:e9560b38dbd2b3332f7fce",
    measurementId: "G-NYBRV51K6Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seedDeveloper = async (email: string) => {
    if (!email) {
        console.error("Please provide an email as an argument.");
        return;
    }

    try {
        const userRef = doc(db, "allowed_users", email);
        await setDoc(userRef, { role: "developer" });
        console.log(`Successfully added ${email} as a developer!`);
    } catch (error) {
        console.error("Error seeding developer: ", error);
    }
};

const emailArg = process.argv[2];
seedDeveloper(emailArg);
