import { firebase } from '../../../firebase.js';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const db = getFirestore(firebase);

export const updateProfile = async (req, res) => {
    const { uid, accountName, accountFname, accountEmail,
        accountNumber, accountBday, accountGender } = req.body;

    // Accounts Collection
    const accountRef = doc(db, `Accounts/seller_${uid}`);
    await setDoc(accountRef, {
        displayName: accountName,
    }, { merge: true });

    // Seller Collection
    const sellerRef = doc(db, `Sellers/${uid}`);
    await setDoc(sellerRef, {
        birthday: accountBday,
        contactNo: accountNumber,
        displayName: accountName,
        email: accountEmail,
        fullName: accountFname,
        gender: accountGender,
    }, { merge: true });
}