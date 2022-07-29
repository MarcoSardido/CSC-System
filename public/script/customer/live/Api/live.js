import { firebase } from '../../../firebaseConfig.js';
import { getFirestore, doc, collection, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase)

const addUserCount = async (uid, sid) => {

    //* CUSTOMER COLLECTION
    const docRef = doc(db, `Customers/${uid}`);
    const docData = await getDoc(docRef);

    //* LIVE SESSION COLLECTION -> SUB-COLLECTION: sessionUsers
    const subColRef = doc(db, `LiveSession/sessionID_${sid}/sessionUsers/${uid}`)
    await setDoc(subColRef, {
        uid: docData.id,
        displayName: docData.data().displayName,
        fullName: docData.data().fullName
    })
}

const removeUserCount = async (uid, sid) => {

    //* LIVE SESSION COLLECTION -> SUB-COLLECTION: sessionUsers
    const subColRef = doc(db, `LiveSession/sessionID_${sid}/sessionUsers/${uid}`)
    await deleteDoc(subColRef);
}

export {
    addUserCount,
    removeUserCount
}