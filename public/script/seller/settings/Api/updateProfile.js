import { firebase } from '../../../firebaseConfig.js';
import { getFirestore, doc, collection, getDoc, getDocs, updateDoc, setDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase);

const changeProfilePhoto = async (uid, data) => {
    const currentDate = new Date();
    const actLogID = `log_${generateId()}`;
    
    try {
        //* ACCOUNTS COLLECTION
        const accountsDocRef = doc(db, `Accounts/seller_${uid}`);
        const accountsDocument = await getDoc(accountsDocRef)
        await updateDoc(accountsDocRef, {
            imgType: data.type,
            userPhoto: data.data,
            profileUpdatedAt: currentDate
        })

         //* COLLECTION: Sellers
         const sellerDocRef = doc(db, `Sellers/${uid}`);
         const sellerDocument = await getDoc(sellerDocRef);

         //* COLLECTION: Accounts -> SUB-COLLECTION: Activity Logs
         const actLogSubDocRef = doc(db, `Accounts/seller_${uid}/Activity Logs/${actLogID}`)
         await setDoc(actLogSubDocRef, {
             dateAdded: new Date(),
             name: sellerDocument.data().displayName !== '' ? sellerDocument.data().displayName : sellerDocument.data().fullName,
             type: ['Profile', 'Photo']
         });

    } catch (error) {
        console.error(`Firestore Error: @changeProfilePhoto -> ${err.message}`)
    }
}

const generateId = () => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

export {
    changeProfilePhoto
}