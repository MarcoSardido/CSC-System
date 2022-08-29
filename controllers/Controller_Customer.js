import { firebase, firebaseAdmin } from '../firebase.js';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, setDoc, updateDoc, getDoc, getDocs, deleteDoc } from 'firebase/firestore';

import { createStripeCustomer, liveCartSession, getAllPaymentList, cancelPaymentIntent } from '../controllers/Controller_Stripe.js'

import date from 'date-and-time';

import ntc from '@yatiac/name-that-color';

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
            uid: res.locals.uid,
            displayAccountInfo: result.accountArray,
            displayCustomerInfo: result.customerArray,
            messageCode: '',
            infoMessage: '',
            onLive: false,
        });
    })
}

const orderStatusPage = async (req, res) => {
    const { uid } = req.body;
    const { id } = req.query;

    try {
        //* CUSTOMER COLLECTION
        const customerColRef = doc(db, `Customers/${uid}`);
        const customerDocument = await getDoc(customerColRef);

        //* CUSTOMER COLLECTION: Sub-collection: Orders
        const orderColRef = doc(db, `Customers/${uid}/Orders/orderID_${id}`);
        const orderDocument = await getDoc(orderColRef);

        const orderItems = orderDocument.data().items;

        for (const [itemIndex, itemValue] of orderItems.entries()) {
            let getComponent = itemValue.color.substring(4, itemValue.color.length - 1).replace(/ /g, '').split(',');
            let hexValue = rgbToHex(getComponent[0], getComponent[1], getComponent[2]);
            let colorName = ntc(`#${hexValue}`).colorName;

            orderItems[itemIndex].subTotal = formatThousands(orderItems[itemIndex].subTotal / 100) + '.00';
            orderItems[itemIndex].colorName = colorName;
        }

        let orderItem = {
            id: orderDocument.data().id,
            placedOn: convertStringDateToNumDate(orderDocument.data().placedOn),
            shippedOn: orderDocument.data().shippedOn !== '' ? convertStringDateToNumDate(orderDocument.data().shippedOn) : '',
            deliveredOn :orderDocument.data().deliveredOn !== '' ? convertStringDateToNumDate(orderDocument.data().deliveredOn) : '',
            status: orderDocument.data().status,
            customer: {
                name: customerDocument.data().displayName,
                contactNo: customerDocument.data().contactNo
            },
            orderAddress: orderDocument.data().orderAddress,
            items: orderItems,
            totalAmount: formatThousands(orderDocument.data().totalAmount / 100) + '.00',
            modeOfPayment: orderDocument.data().modeOfPayment === 'COD' ? 'Cash On Delivery' : 'Credit Card'
        }

        userData(uid).then(result => {
            res.render('customer/orderStatus', {
                layout: 'layouts/customerLayout',
                uid: res.locals.uid,
                displayAccountInfo: result.accountArray,
                displayCustomerInfo: result.customerArray,
                displayOrderInfo: orderItem,
                messageCode: '',
                infoMessage: '',
                onLive: false,
            });
        })

    } catch (error) {
        console.error(`Customer Controller Error -> @orderStatusPage: ${error.message}`)
    }
}







const reviewPage = (req, res) => {
    const uid = req.body.uid;

    try {
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

    } catch (error) {
        console.error(`Customer Controller Error -> @reviewPage: ${error.message}`)
    }
}








const settingsPage = (req, res) => {
    const uid = req.body.uid;

    try {
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


    } catch (error) {
        console.error(`Customer Controller Error -> @settingsPage: ${error.message}`)
    }
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
        delete orderItems[itemIndex].productID;
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
            displayName: customerDoc.data().displayName
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
    currentItemObj.orderAddress = customer.address;

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

const stringDateFormat = () => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    }).replace(/ /g, ' ');
    return formattedDate;
}

const convertStringDateToNumDate = (strDate) => {
    let stringDate = strDate.split(" ");
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let j = 0; j < months.length; j++) {
        if (stringDate[1] == months[j]) {
            stringDate[1] = months.indexOf(months[j]) + 1;
        }
    }
    if (stringDate[1] < 10) {
        stringDate[1] = '0' + stringDate[1];
    }
    if (stringDate[0] < 10) {
        stringDate[0] = '0' + stringDate[0];
    }
    let result = `${stringDate[1]}/${stringDate[0]}/${stringDate[2]}`;
    return result;
}

const rgbToHex = (r, g, b) => {
    let rgb = b | (g << 8) | (r << 16);
    return (0x1000000 | rgb).toString(16).substring(1);
}

const formatThousands = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}



export {
    customerDash,

    orderPage,
    orderStatusPage,

    reviewPage,

    settingsPage,
    profileUpdate,

    liveSession,
    livePayment,
    livePaymentSuccess
}