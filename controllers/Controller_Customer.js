'use strict';

import { firebase, firebaseAdmin } from '../firebase.js';
import { getAuth, onAuthStateChanged } from  'firebase/auth';
import { getFirestore, collection, doc, addDoc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

import Customer from '../models/Model_Customer.js';
import Account from '../models/Model_Account.js';
// import Order from '../models/Model_Order';

import date from 'date-and-time';

const adminAuth = firebaseAdmin.auth();
const auth = getAuth(firebase);
const db = getFirestore(firebase);

const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/PNG'];
 const now = new Date();


// Protected Route
const customerDash = (req, res) => {
    const uid = req.body.uid;
    //const userInfo = req.body.user;

    adminAuth.getUser(uid).then( async (userRecord) => {

        const docRef = doc(db, 'Accounts', userRecord.uid);
        const docSnap = await getDoc(docRef);

        // If no user document, then create a new one
        if (!docSnap.exists()) {

            await setDoc(doc(db, 'Accounts', userRecord.uid), {
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

        } else { // If there is user document, then update signin time

            await setDoc(doc(db, 'Accounts', userRecord.uid), {
                signedInAt: date.format(now, 'MMM DD, YYYY hh:mm A [GMT]Z')
            }, {merge: true});

            const customerArray = [];
            const accountArray = [];

            const accountRef = doc(db, 'Accounts', userRecord.uid);
            const accountData = await getDoc(accountRef);

            const account = new Account (
                accountData.id,
                accountData.data().accRole,
                accountData.data().accStatus,
                accountData.data().createdAt,
                accountData.data().displayName,
                accountData.data().email,
                accountData.data().imgType,
                accountData.data().isVerified,
                accountData.data().profileUpdatedAt,
                accountData.data().signedInAt,
                accountData.data().userPhoto
            );
            accountArray.push(account);

            const customerRef = doc(db, 'Customers', userRecord.uid);
            const customerData = await getDoc(customerRef);

            const customer = new Customer (
                customerData.id,
                customerData.data().birthday,
                customerData.data().contactNo,
                customerData.data().displayName,
                customerData.data().email,
                customerData.data().fullName,
                customerData.data().gender,
                customerData.data().isAnonymous
            );
            customerArray.push(customer);

            console.log('User Successfully Logged in: ' + userRecord.uid);

            res.render('customer/dashboard', { 
                title: 'Customer Center',
                layout: 'layouts/customerLayout',
                displayAccountInfo: accountArray,
                displayCustomerInfo: customerArray,
                messageCode: '',
                infoMessage: '',
            });
        }
    }).catch(error => {
        console.error(`Error fetching user data: ${error}`);
    });

    
};

const profileUpdate = async (req, res) => {
    const {user, profilePhoto, displayName, fullName, email, contactNo, birthday, gender } = req.body;

    const parsedImg = JSON.parse(profilePhoto);

    if(parsedImg != null && imageMimeTypes.includes(parsedImg.type)) {
        const convertedImg = parsedImg.data;
        const imgType = parsedImg.type;

        try {
            await setDoc(doc(db, 'Accounts', user), {
                displayName: displayName,
                email: email,
                imgType: imgType,
                profileUpdatedAt: date.format(now, 'MMM DD, YYYY hh:mm A [GMT]Z'),
                signedInAt: date.format(now, 'MMM DD, YYYY hh:mm A [GMT]Z'),
                userPhoto: convertedImg
            }, {merge: true});
            
            await setDoc(doc(db, 'Customers', user), {
                birthday: birthday,
                contactNo: contactNo,
                displayName: displayName,
                email: email,
                fullName: fullName,
                gender: gender,
            }, {merge: true});

            const customerArray = [];
            const accountArray = [];

            const accountRef = doc(db, 'Accounts', user);
            const accountData = await getDoc(accountRef);

            const account = new Account (
                accountData.id,
                accountData.data().accRole,
                accountData.data().accStatus,
                accountData.data().createdAt,
                accountData.data().displayName,
                accountData.data().email,
                accountData.data().imgType,
                accountData.data().isVerified,
                accountData.data().profileUpdatedAt,
                accountData.data().signedInAt,
                accountData.data().userPhoto
            );
            accountArray.push(account);

            const customerRef = doc(db, 'Customers', user);
            const customerData = await getDoc(customerRef);

            const customer = new Customer (
                customerData.id,
                customerData.data().birthday,
                customerData.data().contactNo,
                customerData.data().displayName,
                customerData.data().email,
                customerData.data().fullName,
                customerData.data().gender,
                customerData.data().isAnonymous
            );
            customerArray.push(customer);

            console.log('Profile successfully updated!')

            res.render('customer/settings', {
                title: 'Customer Center',
                layout: 'layouts/customerLayout',
                displayAccountInfo: accountArray,
                displayCustomerInfo: customerArray,
                messageCode: '',
                infoMessage: '',
            })

        } catch (error) {
            console.error('@AccountUpdate:', error);
        }
    }

    

}




export { 
    customerDash,
    profileUpdate
}