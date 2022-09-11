import * as config from '../../../config.js';
import Stripe from 'stripe';

import { firebase, firebaseAdmin } from '../../../firebase.js';
import { getFirestore, collection, doc, addDoc, setDoc, getDoc, getDocs } from 'firebase/firestore';

import { hasSubscription } from '../../Stripe/Controller_Stripe.js';

const adminAuth = firebaseAdmin.auth();
const db = getFirestore(firebase);

const stripe = new Stripe(config.STRIPE_PRIVATE_KEY);


export const dashboard = async (req, res) => {
    const uid = req.body.uid;
    const sellerData = {};

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

                    const sellerSubRef = collection(db, `Sellers/${uid}/Business Information`)
                    const sellerSubData = await getDocs(sellerSubRef);
                    let storeName;
                    sellerSubData.forEach(item => {
                        storeName = item.id
                    })

                    //* ACCOUNTS COLLECTION
                    const accountColRef = doc(db, `Accounts/seller_${uid}`);
                    const accountColDoc = await getDoc(accountColRef);

                    //* SELLER COLLECTION
                    const sellerColRef = doc(db, `Sellers/${uid}`);
                    const sellerColDoc = await getDoc(sellerColRef);

                    //* STRIPE COLLECTION -> SUB-COLLECTION: Services
                    const stripeColRef = doc(db, `Stripe Accounts/seller_${uid}/Services/Subscription`)
                    const stripeColDoc = await getDoc(stripeColRef);

                    sellerData.accountCol = accountColDoc.data();
                    sellerData.sellerCol = sellerColDoc.data();
                    sellerData.stripeCol = stripeColDoc.data();

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
                            sellerInfo: sellerData,
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
                            sellerInfo: sellerData,
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
                            sellerInfo: sellerData,
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
                        isSelling: false,
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
                    isSelling: false,
                });
            };
        });

    } catch (error) {
        console.error(error.message);
    }

};