import { firebase } from '../../../firebaseConfig.js';
import { getFirestore, doc, collection, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase);

const addItem = async (uid, roomID, itemData) => {
    const uniqueID = generateId();

    try {
        //* LIVE SESSION COLLECTION -> SUB-COLLECTION: sessionUsers -> SUB-COLLECTION: LiveCart
        const cartSubColRef = doc(db, `LiveSession/sessionID_${roomID}/sessionUsers/${uid}/LiveCart/itemID_${uniqueID}`);
        await setDoc(cartSubColRef, {
            id: uniqueID,
            ...itemData
        });

    } catch (error) {
        console.error(`FireStore Error -> @addItem: ${error.message}`)
    }
}

const getAllItems = async (uid, roomID) => {
    const cartItemsArray = [];

    try {
        //* LIVE SESSION COLLECTION -> SUB-COLLECTION: sessionUsers -> SUB-COLLECTION: LiveCart
        const cartSubColRef = collection(db, `LiveSession/sessionID_${roomID}/sessionUsers/${uid}/LiveCart`);
        const cartSubColDocs = await getDocs(cartSubColRef);
        cartSubColDocs.forEach(doc => cartItemsArray.push(doc.data()))

        return cartItemsArray;

    } catch (error) {
        console.error(`FireStore Error -> @getAllItems: ${error.message}`)
    }
}

const generateId = () => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 15; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

export {
    addItem,
    getAllItems
}