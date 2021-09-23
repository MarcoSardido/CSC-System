'use strict';

import { firebase, firebaseAdmin } from '../firebase.js';
import { getAuth } from  'firebase/auth';
// import { } from './Controller_Auth.js';

import { getFirestore, collection, doc, addDoc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

// const Customer = require('../models/Model_Customer');
// const Order = require('../models/Model_Order');

import date from 'date-and-time';

const adminAuth = firebaseAdmin.auth();
const auth = getAuth(firebase);
const db = getFirestore(firebase);

const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/PNG'];



// Protected Route
const customerDash = (req, res) => {
    const uid = req.body.uid;

    adminAuth.getUser(uid).then( async (userRecord) => {

        const now = new Date();

        const docRef = doc(db, 'Accounts', userRecord.uid);
        const docSnap = await getDoc(docRef);

        // If no user document, then create a new one
        if (!docSnap.exists()) {

            await setDoc(doc(db, 'Accounts', userRecord.uid), {
                accRole: "Customer",
                accStatus: "Active",
                createdAt: date.format(now, 'MMM DD, YYYY HH:mm:ss'),
                email: userRecord.email,
                userName: '',
                profileUpdatedAt: '',
                signedInAt: date.format(now, 'MMM DD, YYYY HH:mm:ss')
            });

            await setDoc(doc(db, 'Customers', userRecord.uid), {
                birthday: '',
                contactNo: '',
                displayName: '',
                email: userRecord.email,
                fullName: '',
                gender: '',
                isAnonymous: false,
            });

        } else { // If there is user document, then update signin time

            await setDoc(doc(db, 'Accounts', userRecord.uid), {
                signedInAt: date.format(now, 'MMM DD, YYYY HH:mm:ss')
            }, {merge: true});

        }
    
        console.log('User Successfully Logged in: ' + userRecord.uid);

    }).catch(error => {
        console.error(`Error fetching user data: ${error}`);
    });

    res.render('customer/dashboard', { 
        title: 'Customer Center',
        layout: 'layouts/customerLayout',
        messageCode: '',
        infoMessage: ''
    });
};




export { customerDash }