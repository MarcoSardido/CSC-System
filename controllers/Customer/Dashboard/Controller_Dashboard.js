import { firebase, firebaseAdmin } from '../../../firebase.js';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

import userData from '../_PartialFunctions/userData.js';

import date from 'date-and-time';
const now = new Date();

const adminAuth = firebaseAdmin.auth();
const db = getFirestore(firebase);

export const dashboard = (req, res) => {
    const uid = req.body.uid;

    adminAuth.getUser(uid).then(async (userRecord) => {
        const docRef = doc(db, 'Accounts', `customer_${userRecord.uid}`);
        const docSnap = await getDoc(docRef);

        // If no user document, then create a new one
        if (!docSnap.exists()) {

            await setDoc(doc(db, 'Accounts', `customer_${userRecord.uid}`), {
                id: userRecord.uid,
                accRole: "Customer",
                accStatus: "Active",
                createdAt: date.format(now, 'MMM DD, YYYY hh:mm A [GMT]Z'),
                displayName: userRecord.displayName === undefined ? "" : userRecord.displayName,
                email: userRecord.email,
                imgType: '',
                isVerified: userRecord.emailVerified,
                profileUpdatedAt: '',
                signedInAt: date.format(now, 'MMM DD, YYYY hh:mm A [GMT]Z'),
                signedOutAt: '',
                userPhoto: '',
            });

            await setDoc(doc(db, 'Customers', userRecord.uid), {
                birthday: '',
                contactNo: '',
                displayName: userRecord.displayName === undefined ? "" : userRecord.displayName,
                email: userRecord.email,
                fullName: '',
                gender: '',
                isAnonymous: false,
            });

        } else { // If there is user document, then update sign in time

            await setDoc(doc(db, 'Accounts', `customer_${userRecord.uid}`), {
                signedInAt: date.format(now, 'MMM DD, YYYY hh:mm A [GMT]Z')
            }, { merge: true });

            userData(userRecord.uid).then(result => {
                res.render('customer/dashboard', {
                    layout: 'layouts/customerLayout',
                    displayAccountInfo: result.accountArray,
                    displayCustomerInfo: result.customerArray,
                    messageCode: '',
                    infoMessage: '',
                    onLive: false,
                });
            })
        }
    }).catch(error => {
        console.error(`Error fetching user data: ${error}`);
    });
}