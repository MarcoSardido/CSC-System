import { firebase } from '../../../firebase.js';
import { getFirestore, collection, doc, setDoc, updateDoc, getDoc, getDocs, deleteDoc } from 'firebase/firestore';

import { createStripeCustomer, liveCartSession, getAllPaymentList, cancelPaymentIntent } from '../../Stripe/Controller_Stripe.js'

import userData from '../../Customer/_PartialFunctions/userData.js';

const db = getFirestore(firebase);

const currentItemObj = {};
const removeItems = [];
let currentRoomUrl, isCheckoutCancelled = true, isAnonymousBuyer;

const liveSession = async (req, res) => {
    const { uid, user } = req.body;
    const { isAnonymous } = req.query;

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
            isAnonymous: isAnonymous
        });
    })
}

const marketPlace = async (req, res) => {
    const { uid, user } = req.body;
    const { isAnonymous } = req.query;

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
        res.render('customer/marketPlace', {
            layout: 'layouts/customerLayout',
            displayAccountInfo: result.accountArray,
            displayCustomerInfo: result.customerArray,
            onLive: true
        });
    })
}

const livePaymentSuccess = async (req, res) => {
    const { uid, user } = req.body;

    let splitResult = currentRoomUrl.split("/");
    let roomID = splitResult[splitResult.length - 1].split('?')[0];

    // To prevent checkout cancelation
    isCheckoutCancelled = false;

    //? To remove items later...
    for (const itemIndex of currentItemObj.currentCheckoutItems) {
        removeItems.push(itemIndex.id)
    }

    //* =================================================================================================== 
    // ========================================== Firebase ================================================
    //* ===================================================================================================
    // Seller UID
    let roomHost;

    // orderID && transactionID
    const orderUniqueID = generateId(), transUniqueID = generateId();

    const orderItems = currentItemObj.currentCheckoutItems;

    // :: Live Selling => Get sellerUID
    const liveSessionRef = doc(db, `LiveSession/sessionID_${roomID}`);
    const liveSessionDoc = await getDoc(liveSessionRef);
    roomHost = liveSessionDoc.data().sellerID;


    for (const [itemIndex, itemValue] of orderItems.entries()) {
        // :: Live Selling => Live Cart
        const liveCartColRef = doc(db, `LiveSession/sessionID_${roomID}/sessionUsers/${uid}/LiveCart/${itemValue.id}`);
        const liveCartDoc = await getDoc(liveCartColRef);
        orderItems[itemIndex].image = liveCartDoc.data().itemImg;

        delete orderItems[itemIndex].id;
    }

    // :: Live Selling => Get sellerUID
    const sellerSessionRef = doc(db, `Sellers/${roomHost}/LiveSessions/sessionID_${roomID}`);
    const sellerSessionDoc = await getDoc(sellerSessionRef);

    // :: Customer Collection
    const customerRef = doc(db, `Customers/${uid}`);
    const customerDoc = await getDoc(customerRef);

    // :: Customer Collection -> Orders
    const customerOrderRef = doc(db, `Customers/${uid}/Orders/orderID_${orderUniqueID}`);
    await setDoc(customerOrderRef, {
        id: orderUniqueID,
        transactionID: transUniqueID,
        seller: {
            uid: roomHost,
            storeName: sellerSessionDoc.data().roomName
        },
        items: currentItemObj.currentCheckoutItems,
        modeOfPayment: currentItemObj.currentPaymentMethod,
        placedOn: stringDateFormat(),
        shippedOn: '',
        deliveredOn: '',
        totalAmount: currentItemObj.currentPaymentAmount,
        orderAddress: currentItemObj.orderAddress,
        status: 'Processing',
    })


    // :: Seller Collection -> Transaction
    const sellerTransactionRef = doc(db, `Sellers/${roomHost}/Transactions/transactionID_${transUniqueID}`);
    await setDoc(sellerTransactionRef, {
        id: transUniqueID,
        orderID: orderUniqueID,
        stripePaymentID: currentItemObj.currentPaymentID,
        customer: {
            uid: customerDoc.id,
            address: currentItemObj.orderAddress,
            name: isAnonymousBuyer === 'true' ? 'Anonymous Buyer' : customerDoc.data().displayName,
            phone: customerDoc.data().contactNo,
            checkoutName: currentItemObj.checkoutName,
            checkoutPhone: currentItemObj.checkoutPhone,
        },
        items: currentItemObj.currentCheckoutItems,
        date: stringDateFormat(),
        payment: currentItemObj.currentPaymentMethod,
        status: 'Success',
        totalPrice: currentItemObj.currentPaymentAmount
    })

    // :: Live Selling -> Customer Live Cart
    const liveCartRef = collection(db, `LiveSession/sessionID_${roomID}/sessionUsers/${uid}/LiveCart`);
    const liveCartDoc = await getDocs(liveCartRef)
    liveCartDoc.forEach(document => {
        removeItems.map(item => {
            if (document.id === item) {

                //Remove items in live 
                const removeCartItem = doc(db, `LiveSession/sessionID_${roomID}/sessionUsers/${uid}/LiveCart/${document.id}`);
                deleteDoc(removeCartItem);
            }
        })
    })

    //* =================================================================================================== 
    // ========================================== Stripe ==================================================
    //* ===================================================================================================
    const last10Payments = await getAllPaymentList();

    // :: Stripe Collection
    const stripePaymentRef = collection(db, `Stripe Accounts/customer_${uid}/Payment Intents`);
    const stripePaymentDoc = await getDocs(stripePaymentRef);

    stripePaymentDoc.forEach(document => {
        for (const paymentIndex of last10Payments) {

            if (document.data().paymentIntentID === currentItemObj.currentPaymentID && paymentIndex.paymentStatus === 'succeeded') {
                // Update firebase payment status to success
                const updateStripePaymentRef = doc(db, `Stripe Accounts/customer_${uid}/Payment Intents/${document.id}`);
                updateDoc(updateStripePaymentRef, {
                    paymentIntentStatus: paymentIndex.paymentStatus
                });

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
            isAnonymous: isAnonymousBuyer
        });
    })
}

const livePayment = async (req, res) => {
    const { currentUrl, customer, items, method, isAnonymous } = req.body;
    const stripeAccounts = [];

    isAnonymousBuyer = isAnonymous;

    // For later if payment has made
    currentItemObj.currentCheckoutItems = items;
    currentItemObj.currentPaymentMethod = method;
    currentItemObj.orderAddress = customer.address;
    currentItemObj.checkoutPhone = customer.contactNo;
    currentItemObj.checkoutName = `${customer.fName} ${customer.lName}`;


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

const stringDateFormat = () => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    }).replace(/ /g, ' ');
    return formattedDate;
}

export {
    liveSession,
    marketPlace,
    livePayment,
    livePaymentSuccess
}