import { firebase, firebaseAdmin } from '../firebase.js';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, setDoc, getDoc, getDocs, deleteDoc } from 'firebase/firestore';

import { createStripeCustomer, liveCartSession, getAllPaymentList, cancelPaymentIntent } from '../controllers/Controller_Stripe.js'

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


};

const orderPage = (req, res) => {
    const uid = req.body.uid;

    userData(uid).then(result => {
        res.render('customer/order', {
            layout: 'layouts/customerLayout',
            displayAccountInfo: result.accountArray,
            displayCustomerInfo: result.customerArray,
            messageCode: '',
            infoMessage: '',
            onLive: false,
        });
    })
}

const reviewPage = (req, res) => {
    const uid = req.body.uid;

    userData(uid).then(result => {
        res.render('customer/review', {
            layout: 'layouts/customerLayout',
            displayAccountInfo: result.accountArray,
            displayCustomerInfo: result.customerArray,
            messageCode: '',
            infoMessage: '',
            onLive: false,
        });
    })
}

const settingsPage = (req, res) => {
    const uid = req.body.uid;

    userData(uid).then(result => {
        res.render('customer/settings', {
            layout: 'layouts/customerLayout',
            displayAccountInfo: result.accountArray,
            displayCustomerInfo: result.customerArray,
            messageCode: '',
            infoMessage: '',
            onLive: false,
        });
    })
}

const profileUpdate = async (req, res) => {

    const { user, profilePhoto, displayName, fullName, email, contactNo, birthday, gender } = req.body;
    const parsedImg = JSON.parse(profilePhoto);

    if (parsedImg != null && imageMimeTypes.includes(parsedImg.type)) {
        const convertedImg = parsedImg.data;
        const imgType = parsedImg.type;

        try {
            await setDoc(doc(db, 'Accounts', `customer_${user}`), {
                displayName: displayName,
                email: email,
                imgType: imgType,
                profileUpdatedAt: date.format(now, 'MMM DD, YYYY hh:mm A [GMT]Z'),
                signedInAt: date.format(now, 'MMM DD, YYYY hh:mm A [GMT]Z'),
                userPhoto: convertedImg
            }, { merge: true });

            await setDoc(doc(db, 'Customers', user), {
                birthday: birthday,
                contactNo: contactNo,
                displayName: displayName,
                email: email,
                fullName: fullName,
                gender: gender,
            }, { merge: true });

            const customerArray = [];
            const accountArray = [];

            const accountRef = doc(db, 'Accounts', `customer_${user}`);
            const accountData = await getDoc(accountRef);

            const account = new Account(
                accountData.data().id,
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

            const customer = new Customer(
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

            console.log(`---Profile successfully updated!---\ncustomerID: ${user}`)

            res.render('customer/settings', {
                layout: 'layouts/customerLayout',
                displayAccountInfo: accountArray,
                displayCustomerInfo: customerArray,
                messageCode: '',
                infoMessage: '',
            })

        } catch (error) {
            console.error('@AccountUpdate:', error);
        }
    };
};


const currentItemObj = {};
const removeItems = [];
let currentRoomUrl, isCheckoutCancelled = true;
const liveSession = async (req, res) => {
    const { uid, user } = req.body;

    // Stripe
    const last10Payments = await getAllPaymentList();

    // Firebase
    const stripePaymentRef = collection(db, `Stripe Accounts/customer_${uid}/Payment Intents`);
    const stripePaymentDoc = await getDocs(stripePaymentRef);

    if (currentItemObj.currentPaymentID && isCheckoutCancelled) {
        cancelPaymentIntent(currentItemObj.currentCheckoutID).then(result => {

            stripePaymentDoc.forEach(document => {
                for (const paymentIndex of last10Payments) {

                    if (document.data().paymentIntentID === result.payment_intent && paymentIndex.paymentStatus === 'canceled') {
                        // Update firebase payment status to success
                        const updateStripePaymentRef = doc(db, `Stripe Accounts/customer_${uid}/Payment Intents/${document.id}`);
                        setDoc(updateStripePaymentRef, {
                            paymentIntentStatus: paymentIndex.paymentStatus
                        }, { merge: true });

                        break;
                    } else {
                        continue;
                    }
                }
            })

        })
    }

    userData(uid).then(result => {
        res.render('customer/liveSelling', {
            layout: 'layouts/customerLayout',
            displayAccountInfo: result.accountArray,
            displayCustomerInfo: result.customerArray,
            onLive: true,
            messageCode: '',
            infoMessage: '',
        });
    })
}

const livePaymentSuccess = async (req, res) => {
    const { uid, user } = req.body;

    let splitResult = currentRoomUrl.split("/");
    let roomID = splitResult[splitResult.length - 1];

    // To prevent checkout cancelation
    isCheckoutCancelled = false;

    for (const itemIndex of currentItemObj.currentCheckoutItems) {
        removeItems.push(itemIndex.id)
    }

    // Stripe
    const last10Payments = await getAllPaymentList();

    // Firebase
    // :: Stripe Collection
    const stripePaymentRef = collection(db, `Stripe Accounts/customer_${uid}/Payment Intents`);
    const stripePaymentDoc = await getDocs(stripePaymentRef);

    // :: Customer Collection
    const uniqueID = generateId();
    const currentDateAndTime = new Date();
    const customerOrderRef = doc(db, `Customers/${uid}/Orders/orderID_${uniqueID}`);
    await setDoc(customerOrderRef, {
        items: currentItemObj.currentCheckoutItems,
        modeOfPayment: currentItemObj.currentPaymentMethod,
        placedOn: currentDateAndTime,
        totalAmount: currentItemObj.currentPaymentAmount,
        status: 'Processing',
    })

    // :: Live Selling -> Customer Live Cart
    const liveCartRef = collection(db, `LiveSession/sessionID_${roomID}/sessionUsers/${uid}/LiveCart`);
    const liveCartDoc = await getDocs(liveCartRef)
    liveCartDoc.forEach(document => {
        removeItems.map(item => {
            if (document.id === item) {
                const removeCartItem = doc(db, `LiveSession/sessionID_${roomID}/sessionUsers/${uid}/LiveCart/${document.id}`);
                deleteDoc(removeCartItem);
            }
        })
    })

    stripePaymentDoc.forEach(document => {
        for (const paymentIndex of last10Payments) {

            if (document.data().paymentIntentID === currentItemObj.currentPaymentID && paymentIndex.paymentStatus === 'succeeded') {
                // Update firebase payment status to success
                const updateStripePaymentRef = doc(db, `Stripe Accounts/customer_${uid}/Payment Intents/${document.id}`);
                setDoc(updateStripePaymentRef, {
                    paymentIntentStatus: paymentIndex.paymentStatus
                }, { merge: true });

                break;
            } else {
                continue;
            }
        }
    })

    userData(uid).then(result => {
        res.render('partials/customer/stripe/success', {
            layout: 'layouts/customerLayout',
            displayAccountInfo: result.accountArray,
            displayCustomerInfo: result.customerArray,
            onLive: true,
            messageCode: '',
            infoMessage: '',
        });
    })
}

// Stripe: Live Cart Checkout
const livePayment = async (req, res) => {
    const { currentUrl, customer, items, method } = req.body;
    const stripeAccounts = [];

    // For later if payment has made
    currentItemObj.currentCheckoutItems = items;
    currentItemObj.currentPaymentMethod = method;

    try {
        // Stripe Account Collection
        const checkStripeColRef = collection(db, `Stripe Accounts`);
        const checkStripeColDoc = await getDocs(checkStripeColRef);
        checkStripeColDoc.forEach(doc => stripeAccounts.push(doc.id))

        if (!stripeAccounts.includes(`customer_${customer.uid}`)) {
            // Create stripe customer account
            const stripeCustomerID = await createStripeCustomer(customer.fName, customer.lName, customer.contactNo, customer.email);

            const addStripeColRef = doc(db, `Stripe Accounts`, `customer_${customer.uid}`);
            await setDoc(addStripeColRef, {
                customerID: stripeCustomerID.id
            });
        }

        const getStripeCustomerColRef = doc(db, `Stripe Accounts/customer_${customer.uid}`)
        const getStripeCustomerColDoc = await getDoc(getStripeCustomerColRef);
        const stripeCustomer = getStripeCustomerColDoc.data().customerID;

        liveCartSession(items, stripeCustomer, currentUrl).then(({ session, roomUrl }) => {

            currentRoomUrl = roomUrl;
            currentItemObj.currentPaymentID = session.payment_intent;
            currentItemObj.currentCheckoutID = session.id;
            currentItemObj.currentPaymentAmount = session.amount_total;

            res.json({ paymentUrl: session.url, paymentID: session.payment_intent, paymentStatus: session.status });
        });

    } catch (error) {
        console.error(`Error stripe live payment: ${error.message}`);
        res.status(500).json({ error: error.message })
    }
}







// Firestore Functions
async function userData(uid) {

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




// Partial Functions
const generateId = () => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 15; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}



export {
    customerDash,
    orderPage,
    reviewPage,

    settingsPage,
    profileUpdate,

    liveSession,
    livePayment,
    livePaymentSuccess
}