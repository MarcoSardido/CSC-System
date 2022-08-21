import { firebase } from '../../../firebaseConfig.js';
import { getFirestore, doc, collection, getDoc, getDocs, updateDoc, setDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase);

const changeProfilePhoto = async (uid, data) => {
    try {
        //* ACCOUNTS COLLECTION
        const accountsColRef = doc(db, `Accounts/seller_${uid}`);
        await updateDoc(accountsColRef, {
            userPhoto: `data:${data.type};base64,${data.data}`
        })

    } catch (error) {
        console.error(`Firestore Error: @changeProfilePhoto -> ${err.message}`)
    }
}

const updateProfileInfo = async (uid, data) => {

}

export {
    changeProfilePhoto,
    updateProfileInfo
}