import { firebase } from '../../../firebaseConfig.js';
import { getFirestore, doc, collection, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase);

const addUser = async (uid, roomID) => {
    const sessionUsersIdArray = [];

    try {
        //* CUSTOMERS COLLECTION
        const customerColRef = doc(db, `Customers/${uid}`);
        const customerColDoc = await getDoc(customerColRef);

        //* LIVE SESSION -> SUB-COLLECTION: sessionUsers
        const usersSubColRef = collection(db, `LiveSession/sessionID_${roomID}/sessionUsers`);
        const usersSubColDocs = await getDocs(usersSubColRef);

        //? Collection Reference For Adding User in sessionUsers 
        const addUser = doc(db, `LiveSession/sessionID_${roomID}/sessionUsers/${uid}`);

        if (usersSubColDocs.empty) {
            //? No sessionUsers Collection -> Add user
            await setDoc(addUser, {
                uid: customerColDoc.id,
                displayName: customerColDoc.data().displayName,
                fullName: customerColDoc.data().fullName
            })

        } else {
            //? Has sessionUsers Collection -> Check if user exists
            usersSubColDocs.forEach(doc => sessionUsersIdArray.push(doc.id))

            if (!sessionUsersIdArray.includes(uid)) {
                await setDoc(addUser, {
                    uid: customerColDoc.id,
                    displayName: customerColDoc.data().displayName,
                    fullName: customerColDoc.data().fullName
                })
            }
        }
    } catch (error) {
        console.error(`FireStore Error -> @addUser: ${error.message}`)
    }
}

const removeUser = async (uid, roomID) => {
    try {
        //* LIVE SESSION COLLECTION -> SUB-COLLECTION: sessionUsers
        const subColRef = doc(db, `LiveSession/sessionID_${roomID}/sessionUsers/${uid}`)
        await deleteDoc(subColRef);

    } catch (error) {
        console.error(`FireStore Error -> @removeUser: ${error.message}`)
    }
}

const roomExpire = async (uid, roomID) => {
    const deleteCartItemsArray = [];
    try {
        //* LIVE SESSION COLLECTION -> SUB-COLLECTION: sessionUsers -> SUB-COLLECTION: LiveCart
        const liveCartSubColRef = collection(db, `LiveSession/sessionID_${roomID}/sessionUsers/${uid}/LiveCart`);
        const liveCartSubColDocs = await getDocs(liveCartSubColRef);
        liveCartSubColDocs.forEach(doc => deleteCartItemsArray.push(doc.id));

        //? Delete all items in LiveCart 
        for (const itemIndex of deleteCartItemsArray) {
            const deleteCartItem = doc(db, `LiveSession/sessionID_${roomID}/sessionUsers/${uid}/LiveCart/${itemIndex}`);
            await deleteDoc(deleteCartItem);
        }

        //* LIVE SESSION COLLECTION
        const liveSessionColRef = doc(db, `LiveSession/sessionID_${roomID}`);
        await setDoc(liveSessionColRef, {
            sessionStatus: 'Close'
        }, { merge: true});
    } catch (error) {
        console.error(`Firestore Error -> @roomExpire: ${error.message}`)
    }
}

export {
    addUser,
    removeUser,
    roomExpire
}