'use strict';

import * as config from '../config.js';
import Stripe from 'stripe';

import { firebase, firebaseAdmin } from '../firebase.js';
import { getFirestore, collection, doc, addDoc, setDoc, getDoc, getDocs } from 'firebase/firestore';

import { hasSubscription } from './Controller_Stripe.js';

import * as accSubscriptionHandler from '../models/Model_AccSubscription.js';

const adminAuth = firebaseAdmin.auth();
const db = getFirestore(firebase);

const stripe = new Stripe(config.STRIPE_PRIVATE_KEY);


const dashboardPage = async (req, res) => {
    const uid = req.body.uid;
    
    try {
        adminAuth.getUser(uid).then( async(userRecord) => {
            let isVerified = userRecord.emailVerified;

            if (isVerified) { //Already verified

                const stripeAccRef = doc(db, 'Stripe Accounts', `seller_${uid}`);
                const stripeAccData = await getDoc(stripeAccRef);

                const alreadySubscribed = (await hasSubscription()).includes(`${stripeAccData.data().customerID}`);
                
                if (alreadySubscribed) { //Already subscribed

                    const stripeRetrievedSubscription =  await stripe.subscriptions.retrieve(stripeAccData.data().subscriptionID);
                    const stripeCurrentSubBill = new Date(stripeRetrievedSubscription.current_period_start * 1000).toDateString();

                    const stripeSubColRef = doc(db, 'Stripe Accounts', `seller_${uid}`, 'Services', 'Subscription');
                    const stripeSubColData = await getDoc(stripeSubColRef);

                    const sellerRef = doc(db, 'Sellers', uid);
                    const sellerData = await getDoc(sellerRef);

                    if (! (stripeAccData.data().isNew)) { //Old Subscriber

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
                            sellerInfo: sellerData.data()
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
                            sellerInfo: sellerData.data()
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
                            sellerInfo: sellerData.data()
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
                        sellerInfo: ''
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
                    sellerInfo: ''
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
        sellerInfo: ''
    })
}

const addProduct = (req, res) => {
    console.log(req.body)
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
        sellerInfo: ''
    })
}

const reportPage = (req, res) => {

    res.render('seller/manageReport', {
        title: 'report',
        url: "urlPath",
        layout: 'layouts/sellerLayout', 
        verification: '',
        user: '',
        hasSubscription: true,
        subSuccess: '',
        subUpdateSuccess: '',
        sellerInfo: ''
    })
}

 const settingsPage = (req, res) => {

    res.render('seller/settings', {
        title: 'settings',
        url: "urlPath",
        layout: 'layouts/sellerLayout', 
        verification: '',
        user: '',
        hasSubscription: true,
        subSuccess: '',
        subUpdateSuccess: '',
        sellerInfo: ''
    })
}


export {
    dashboardPage,
    addProduct,
    productPage,
    transactionPage,
    reportPage,
    settingsPage
}