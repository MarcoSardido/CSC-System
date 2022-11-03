import { firebase } from '../../../firebase.js';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const db = getFirestore(firebase);

export const updateProfile = async (req, res) => {
    const { uid, accountName, accountFname, accountEmail,
        accountNumber, accountBday, accountGender } = req.body;

    const actLogID = `log_${generateId()}`;
    const currentDate = new Date();

    try {
        //* COLLECTION: Accounts
        const accountRef = doc(db, `Accounts/seller_${uid}`);
        await setDoc(accountRef, {
            displayName: accountName,
            profileUpdatedAt: currentDate
        }, { merge: true });

        //* COLLECTION: Sellers
        const sellerDocRef = doc(db, `Sellers/${uid}`);
        const sellerDocument = await getDoc(sellerDocRef);
        await setDoc(sellerDocRef, {
            birthday: accountBday,
            contactNo: accountNumber,
            displayName: accountName,
            email: accountEmail,
            fullName: accountFname,
            gender: accountGender,
            profileUpdatedAt: currentDate
        }, { merge: true });

        //* COLLECTION: Stripe Accounts
        const stripeAccDocRef = doc(db, `Stripe Accounts/seller_${uid}`);
        const stripeAccDocument = await getDoc(stripeAccDocRef);

        if (stripeAccDocument.data().isNew) {
            await setDoc(stripeAccDocRef, {
                isNew: false
            }, { merge: true });
        }

        //* COLLECTION: Accounts -> SUB-COLLECTION: Activity Logs
        const actLogSubDocRef = doc(db, `Accounts/seller_${uid}/Activity Logs/${actLogID}`)
        await setDoc(actLogSubDocRef, {
            dateAdded: new Date(),
            name: sellerDocument.data().displayName !== '' ? sellerDocument.data().displayName : sellerDocument.data().fullName,
            type: ['Profile', 'Information']
        });

    } catch (error) {
        console.error(`Firestore Error: @updateProfile -> ${error.message}`);
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