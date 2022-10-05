import { firebase } from '../../firebaseConfig.js';
import { getFirestore, doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase)

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    //! TODO: Show toast in seller dashboard when customer buys product in its Marketplace.
    const checkCurrentMarketPlace = async (uid) => {
        const sessionsArray = [];

        //* SELLER COLLECTION -> SUB-COLLECTION: LiveSessions
        const liveSubColRef = collection(db, `Sellers/${uid}/LiveSessions`);
        const liveCollection = await getDocs(liveSubColRef);
        liveCollection.forEach(doc => {
            sessionsArray.push(doc.data().sessionID);
        })

        // for (const sessionIndex of sessionsArray) {
        //     const liveDocRef = doc(db, `LiveSession/sessionID_${sessionIndex}`);
        //     const liveDocument = await getDoc(liveDocRef);
        // }
    }

   






    //? Listen if customer bought item in MarketPlace.
    // 
    //* LIVE SESSION COLLECTION 
   
    onSnapshot(liveDocRef, doc => {
        if (doc.data().customer !== '') {
            showBuyToast(doc.data().customer)
        }
    })



    checkCurrentMarketPlace(trimmedUID);
})