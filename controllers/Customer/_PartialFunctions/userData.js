import { firebase } from '../../../firebase.js';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const db = getFirestore(firebase);

export default async function userData(uid) {
    const accountRef = doc(db, 'Accounts', `customer_${uid}`);
    const accountData = await getDoc(accountRef);

    const accountArray = [];
    accountArray.push({
        id: accountData.data().id,
        accRole: accountData.data().accRole,
        accStatus: accountData.data().accStatus,
        createdAt: accountData.data().createdAt,
        displayName: accountData.data().displayName,
        email: accountData.data().email,
        imgType: accountData.data().imgType,
        isVerified: accountData.data().isVerified,
        profileUpdatedAt: accountData.data().profileUpdatedAt,
        signedInAt: accountData.data().signedInAt,
        userPhoto: accountData.data().userPhoto,
    });

    const customerRef = doc(db, 'Customers', uid);
    const customerData = await getDoc(customerRef);

    const customerArray = [];
    customerArray.push({
        id: customerData.id,
        birthday: customerData.data().birthday,
        contactNo: customerData.data().contactNo,
        displayName: customerData.data().displayName,
        email: customerData.data().email,
        fullName: customerData.data().fullName,
        gender: customerData.data().gender,
        isAnonymous: customerData.data().isAnonymous
    });

    return { accountArray, customerArray }
}