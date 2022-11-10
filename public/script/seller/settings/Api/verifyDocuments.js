import { firebase } from '../../../firebaseConfig.js';
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase);

const uploadDocuments = async (uid, data, path) => {
    let status = {};

    const actLogID = `log_${generateId()}`;

    const subColPath = path === 'citizen' ? 'Citizenship ID' :
                       path === 'personal' ? 'Personal ID' : 'Business License';

    try {
        //* COLLECTION: Seller
        const sellerDocRef = doc(db, `Sellers/${uid}`);
        const sellerDocument = await getDoc(sellerDocRef)

        //* COLLECTION: Seller -> SUB-COLLECTION: Business Documents
        const sellerSubDocRef = doc(db, `Sellers/${uid}/Business Documents/${subColPath}`);
        await setDoc(sellerSubDocRef, {
            imgType: data.type,
            docPhoto: data.data,
            status: 'Pending'
        }, { merge: true});

        //* COLLECTION: Accounts -> SUB-COLLECTION: Activity Logs
        const actLogSubDocRef = doc(db, `Accounts/seller_${uid}/Activity Logs/${actLogID}`)
        await setDoc(actLogSubDocRef, {
            dateAdded: new Date(),
            name: sellerDocument.data().displayName !== '' ? sellerDocument.data().displayName : sellerDocument.data().fullName,
            type: ['Documents', subColPath]
        });

    } catch (error) {
        status.type = 'error';
        status.message = error.message;
    }

    return status;
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
    uploadDocuments
}