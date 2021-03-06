'use strict'

import * as config from '../config.js';
import Stripe from 'stripe';

import { firebase, firebaseAdmin } from '../firebase.js';
import { getFirestore, collection, doc, addDoc, setDoc, getDoc, getDocs } from 'firebase/firestore';

const stripe = new Stripe(config.STRIPE_PRIVATE_KEY);
const db = getFirestore(firebase);


const stripeCheckoutSession = async (req, res)  => {
    const currentUID = req.body.uid;

    try {
        const currentSellerRef = doc(db, 'Accounts', `seller_${currentUID}`);
        const currentSellerData = await getDoc(currentSellerRef);

        const stripeSubColRef = doc(db, 'Stripe Accounts', `seller_${currentUID}`, 'Services', 'Subscription');
        const stripeSubColData = await getDoc(stripeSubColRef);

    
        const getSellerType = (currentSellerData.data().sellerType === 'Individual Seller') ? "sellerType_Individual" : "sellerType_Corporate";
    
        const individualSellerRef = doc(db, 'Stripe Price Handler', getSellerType);
        const individualSellerData = await getDoc(individualSellerRef);

        await setDoc(doc(db, 'Accounts', `seller_${currentUID}`), {
            isVerified: true,
        }, {merge: true});

        if (stripeSubColData.data().customerID === '') {

            const session = await stripe.checkout.sessions.create({
                customer: stripeSubColData.data().customerID,
                payment_method_types: ['card'],
                mode: 'subscription',
                line_items: [{
                    price: individualSellerData.data().stripePriceID,
                    quantity: 1 
                }],
                success_url: `${config.SERVER_URL}/sellercenter/subscription_success/{CHECKOUT_SESSION_ID}`,
                cancel_url: `${config.SERVER_URL}`
            });

            res.json({ url: session.url });

        } else {
            
            const session = await stripe.checkout.sessions.create({
                customer_email: currentSellerData.data().email,
                payment_method_types: ['card'],
                mode: 'subscription',
                line_items: [{
                    price: individualSellerData.data().stripePriceID,
                    quantity: 1 
                }],
                success_url: `${config.SERVER_URL}/sellercenter/subscription_success/{CHECKOUT_SESSION_ID}`,
                cancel_url: `${config.SERVER_URL}`
            });

            res.json({ url: session.url });
        };
        
    } catch (err) {
        console.error(err)
    };
};




const subscriptionSuccess = async (req, res) => {
    const currentCheckoutSessionID = req.params.id;
    let sellerUID;

    try {
        const stripeRetrievedSession = await stripe.checkout.sessions.retrieve(currentCheckoutSessionID);
        const stripeRetrievedSubscription =  await stripe.subscriptions.retrieve(stripeRetrievedSession.subscription);
        const stripeRetrievedProduct = await stripe.products.retrieve(stripeRetrievedSubscription.plan.product);
        
        const subCreated = new Date(stripeRetrievedSubscription.created * 1000).toDateString();
        const currentSubBill = new Date(stripeRetrievedSubscription.current_period_start * 1000).toDateString();
        const NextSubBill = new Date(stripeRetrievedSubscription.current_period_end * 1000).toDateString();


        if (stripeRetrievedSession.payment_status === 'paid') {
        
            const sellerCollection =  await getDocs(collection(db, 'Sellers'));
            sellerCollection.forEach((doc) => {

                if (doc.data().email === stripeRetrievedSession.customer_email) {
                    sellerUID = doc.id;
                }
            });

            await setDoc(doc(db, 'Stripe Accounts', `seller_${sellerUID}`, 'Services', 'Subscription'), {
                sellerType: stripeRetrievedProduct.name,
                subscriptionCreated: subCreated,
                currentSubscriptionBill: currentSubBill,
                nextSubscriptionBill: NextSubBill
            }, {merge: true});

            await setDoc(doc(db, 'Stripe Accounts', `seller_${sellerUID}`), {
                customerID: stripeRetrievedSession.customer,
                subscriptionID: stripeRetrievedSubscription.id
            }, {merge: true});

            // const sellerFName = stripeRetrievedCustomer.name.split(" ")[0];

            // res.render('partials/seller/subSuccess', { 

            //     title: 'Seller Center',
            //     layout: 'layouts/sellerLayout',
            //     subSuccess: 'subscriptionSuccess',
            //     hasSubscription: '',
            //     verification: '',
            //     user: '',
            //     sellerFname: sellerFName
            // });

            console.log(`Successfully Updated Seller: ${sellerUID} \n=> Stripe Customer ID: ${stripeRetrievedSession.customer}`);

            res.redirect('/sellercenter')

        };



    } catch (error) {
        console.error(`ERROR:`,error)
    }
}



async function createStripeCustomer(personalFName, personalLName, personalContact){

    try {
        
        const customer = await stripe.customers.create({
            name: `${personalFName} ${personalLName}`,
            email: createSellerEmail,
            phone: personalContact,
        });

        return customer;

    } catch (error) {
        console.log(error.message);
    }

}

async function hasSubscription(){
    let count = 0;
    const customersWithActiveSubscription = [];

    try {
        const subscriptions = await stripe.subscriptions.list({
            status: 'active'
        });

        while(subscriptions.data[count]) {
            customersWithActiveSubscription.push(subscriptions.data[count].customer);
            count++;
        };

        return customersWithActiveSubscription;

    } catch (error) {
        console.error(error.message)
    };
};

export {
    hasSubscription,
    createStripeCustomer,
    subscriptionSuccess,
    stripeCheckoutSession
}