import { firebase } from '../../../firebaseConfig.js';
import { getFirestore, doc, collection, getDoc, getDocs, updateDoc, setDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase);

const changeProfilePhoto = async (uid, data) => {
    const currentDate = new Date();
    
    try {
        //* ACCOUNTS COLLECTION
        const accountsColRef = doc(db, `Accounts/seller_${uid}`);
        await updateDoc(accountsColRef, {
            imgType: data.type,
            userPhoto: data.data,
            profileUpdatedAt: currentDate
        })

    } catch (error) {
        console.error(`Firestore Error: @changeProfilePhoto -> ${err.message}`)
    }
}

export {
    changeProfilePhoto
}