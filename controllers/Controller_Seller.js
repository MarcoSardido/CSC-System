'use strict';

import * as config from '../config.js';
import Stripe from 'stripe';

import { firebase, firebaseAdmin } from '../firebase.js';
import { getFirestore, collection, doc, addDoc, setDoc, getDoc, getDocs } from 'firebase/firestore';

import { hasSubscription } from './Controller_Stripe.js';

const adminAuth = firebaseAdmin.auth();
const db = getFirestore(firebase);

const stripe = new Stripe(config.STRIPE_PRIVATE_KEY);


const dashboardPage = async (req, res) => {
    const uid = req.body.uid;

    try {
        adminAuth.getUser(uid).then(async (userRecord) => {
            let isVerified = userRecord.emailVerified;

            if (isVerified) { //Already verified

                const stripeAccRef = doc(db, 'Stripe Accounts', `seller_${uid}`);
                const stripeAccData = await getDoc(stripeAccRef);

                const alreadySubscribed = (await hasSubscription()).includes(`${stripeAccData.data().customerID}`);

                if (alreadySubscribed) { //Already subscribed

                    const stripeRetrievedSubscription = await stripe.subscriptions.retrieve(stripeAccData.data().subscriptionID);
                    const stripeCurrentSubBill = new Date(stripeRetrievedSubscription.current_period_start * 1000).toDateString();

                    const stripeSubColRef = doc(db, 'Stripe Accounts', `seller_${uid}`, 'Services', 'Subscription');
                    const stripeSubColData = await getDoc(stripeSubColRef);

                    const sellerRef = doc(db, 'Sellers', uid);
                    const sellerData = await getDoc(sellerRef);

                    const sellerSubRef = collection(db, `Sellers/${uid}/Business Information`)
                    const sellerSubData = await getDocs(sellerSubRef);
                    let storeName;
                    sellerSubData.forEach(item => {
                        storeName = item.id
                    })

                    if (!(stripeAccData.data().isNew)) { //Old Subscriber

                        console.log('Render Dashboard (Old Subscriber)')

                        res.render('seller/manageDashboard', {
                            title: 'dashboard',
                            layout: 'layouts/sellerLayout',
                            messageCode: '',
                            infoMessage: '',
                            verification: '',
                            user: '',
                            hasSubscription: true,
                            subSuccess: '',
                            subUpdateSuccess: '',
                            sellerInfo: sellerData.data(),
                            store: storeName,
                            isSelling: false,

                        });

                    } else if (stripeSubColData.data().subscriptionCreated == stripeSubColData.data().currentSubscriptionBill) { //New Subscription

                        console.log('Render Dashboard (New Subscriber)')

                        res.render('seller/manageDashboard', {
                            title: 'dashboard',
                            layout: 'layouts/sellerLayout',
                            messageCode: '',
                            infoMessage: '',
                            verification: '',
                            user: '',
                            hasSubscription: true,
                            subSuccess: 'subscriptionSuccess',
                            subUpdateSuccess: '',
                            sellerInfo: sellerData.data(),
                            store: storeName,
                            isSelling: false,

                        });

                    } else if (stripeSubColData.data().currentSubscriptionBill != stripeCurrentSubBill) { //Update Subscribed Usage

                        console.log('Render Dashboard (Update Subscriber)')

                        res.render('seller/manageDashboard', {
                            title: 'dashboard',
                            layout: 'layouts/sellerLayout',
                            messageCode: '',
                            infoMessage: '',
                            verification: '',
                            user: '',
                            hasSubscription: true,
                            subSuccess: '',
                            subUpdateSuccess: 'subscriptionUpdateSuccess',
                            sellerInfo: sellerData.data(),
                            store: storeName,
                            isSelling: false,

                        });
                    }

                } else {
                    //Not subscribed, redirect to stripe subscription page -- Step: 2
                    res.render('seller/manageDashboard', {
                        title: 'dashboard',
                        layout: 'layouts/sellerLayout',
                        messageCode: '',
                        infoMessage: '',
                        verification: '',
                        user: userRecord,
                        hasSubscription: false,
                        subSuccess: '',
                        subUpdateSuccess: '',
                        sellerInfo: '',
                        store: '',
                    });
                };

            } else {
                //Show need verification -- Step: 1
                res.render('seller/manageDashboard', {
                    title: 'dashboard',
                    layout: 'layouts/sellerLayout',
                    messageCode: '',
                    infoMessage: '',
                    verification: 'needEmailVerification',
                    user: userRecord,
                    hasSubscription: '',
                    subSuccess: '',
                    sellerInfo: '',
                    store: '',
                });
            };
        });

    } catch (error) {
        console.error(error.message);
    }

};



const productPage = (req, res) => {

    res.render('seller/manageProduct', {
        title: 'products',
        url: "urlPath",
        uid: res.locals.uid,
        layout: 'layouts/sellerLayout',
        verification: '',
        user: '',
        hasSubscription: true,
        subSuccess: '',
        subUpdateSuccess: '',
        sellerInfo: '',
        isSelling: false,
    })
}



const transactionPage = (req, res) => {

    res.render('seller/manageTransaction', {
        title: 'transactions',
        url: "urlPath",
        layout: 'layouts/sellerLayout',
        verification: '',
        user: '',
        hasSubscription: true,
        subSuccess: '',
        subUpdateSuccess: '',
        sellerInfo: '',
        isSelling: false,
    })
}

const reportPage = (req, res) => {

    res.render('seller/manageReport', {
        title: 'report',
        url: "urlPath",
        uid: res.locals.uid,
        layout: 'layouts/sellerLayout',
        verification: '',
        user: '',
        hasSubscription: true,
        subSuccess: '',
        subUpdateSuccess: '',
        sellerInfo: '',
        isSelling: false,
    })
}

const settingsPage = async (req, res) => {
    const uid = req.body.uid;
    const currentTab = req.query.tab === 'account' ? 'account' :
                       req.query.tab === 'faq' ? 'faq' :
                       'about';

    // Get user data
    if (currentTab === 'account') {
        const userData = {};

        // Accounts Collection
        const accountRef = doc(db, `Accounts/seller_${uid}`);
        const accountDoc = await getDoc(accountRef);

        // Seller Collection
        const sellerRef = doc(db, `Sellers/${uid}`);
        const sellerDoc = await getDoc(sellerRef);

        Object.assign(userData, {
            accountPhoto: accountDoc.data().userPhoto,
            accountName: accountDoc.data().displayName,
            accountFname: sellerDoc.data().fullName,
            accountEmail: accountDoc.data().email,
            accountNumber: sellerDoc.data().contactNo,
            accountBirthday: sellerDoc.data().birthday,
            accountGender: sellerDoc.data().gender,
        })

        res.render('seller/settings', {
            title: 'settings',
            url: "urlPath",
            layout: 'layouts/sellerLayout',
            settingsTab: currentTab,
            settingsData: userData,
            verification: '',
            user: '',
            hasSubscription: true,
            subSuccess: '',
            subUpdateSuccess: '',
            sellerInfo: '',
            isSelling: false,
        })
    } else {

        res.render('seller/settings', {
            title: 'settings',
            url: "urlPath",
            layout: 'layouts/sellerLayout',
            settingsTab: currentTab,
            settingsData: '',
            verification: '',
            user: '',
            hasSubscription: true,
            subSuccess: '',
            subUpdateSuccess: '',
            sellerInfo: '',
            isSelling: false,
        })
    }
}

const updateProfile = async (req, res) => {
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




const liveSession = async (req, res) => {

    //* TODO: Make array in db on every customer entered the live room and
    //*       to count all customers and use that as viewers

    res.render('seller/liveSelling', {
        layout: 'layouts/sellerLayout',
        hasSubscription: true,
        verification: '',
        subSuccess: '',
        subUpdateSuccess: '',
        sellerInfo: '',
        isSelling: true,
    })
}



export {
    dashboardPage,
    productPage,
    transactionPage,
    reportPage,
    settingsPage,
    updateProfile,

    liveSession,
}