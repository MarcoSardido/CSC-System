'use strict';

import { firebase, firebaseAdmin } from '../firebase.js';
import { getAuth, sendPasswordResetEmail, sendEmailVerification } from  'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

import { createStripeCustomer } from './Controller_Stripe.js';


import date from 'date-and-time';

const adminAuth = firebaseAdmin.auth();
const auth = getAuth(firebase);
const db = getFirestore(firebase);

const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/PNG'];
const now = new Date();

const currentLoggedInUID = [];

/**
 * SECTION: Start of Customer Section
 */

 /**
  * @const signInAndSignUpRoute => Route for Customer Sign-in and Sign-up
  */
 const signInAndSignUpRoute = (req, res) => {
    const sessionCookie = req.cookies.session;


    // Check if session cookie is available.
    if (!sessionCookie) { 

        //no sessionCookie available, user rendered to login page.
        res.render('authentication/auth', {
            title: 'City Sales Cloud',
            layout: 'layouts/customer_authLayout',
            messageCode: '',
            infoMessage: ''
        });

    } else { 

        //sessionCookie available, user rendered to customer center page
        //to logout.
        res.render('customer/dashboard', { 
            title: 'Customer Center',
            layout: 'layouts/customerLayout',
            displayAccountInfo: [],
            displayCustomerInfo: [],
            messageCode: 'alert-info',
            infoMessage: 'Please logout first'
        });
    }

 };

 /**
  * @const sessionLogin => creates session to the user.
  */
 const sessionLoginCustomer = (req, res) => {

    // get the idToken passed from client side.
    const idToken = req.query.token.toString();

    // session expires in 5hrs.
    const expiresIn = 60 * 60 * 5 * 1000;

    // create a new session if idToken is valid.
    adminAuth.createSessionCookie(idToken, {expiresIn}).then((sessionCookie) => {
        const options = { maxAge: expiresIn, httpOnly: true, secure: true };
        res.cookie('session', sessionCookie, options);

        res.redirect('/customercenter')

    }).catch((error) => {

        // throw a error if idToken is not valid.
        console.error(error);
        res.status(404).send('UNAUTHORIZED REQUEST!');
    });
 };

 /**
  * @const signUp => creates new user.
  */
 const signUp = (req, res) => {
    const { email, password, confirmPassword } = req.body;

    if (password === confirmPassword) {
        adminAuth.createUser({

            email: email,
            password: password

        }).then(userRecord => {
            console.log('Successfully created new user:', userRecord.uid);

            // res.redirect('/customercenter')
                
            res.render('authentication/auth', {
                title: 'City Sales Cloud',
                layout: 'layouts/customer_authLayout',
                messageCode: 'alert-info',
                infoMessage: 'Login with same credentials'
            });

        }).catch((error) => {
            console.error(error);
            const errorMessage = error.message;

            res.render('authentication/auth', { //views/authentication/auth.ejs
                title: 'City Sales Cloud',
                layout: 'layouts/customer_authLayout', //custom layout
                messageCode: 'alert-danger',
                infoMessage: errorMessage
            });
        });

    } else {
        res.render('authentication/auth', {
            title: 'City Sales Cloud',
            layout: 'layouts/customer_authLayout',
            messageCode: 'alert-warning',
            infoMessage: "Password doesn't match"
        });
    }
 }

/**
 * SECTION: End of Customer Section
*/



/**
 * SECTION: Start of Seller Section
 */

 const sellerSignInAndSignUpRoute = (req, res) => {
    res.render('authentication/seller', {
        title: 'City Sales Cloud',
        layout: 'layouts/seller_authLayout',
        messageCode: '',
        infoMessage: ''
    })
 }

 const sellerSignUp = (req, res) => {
    
    const { sellerType, businessName, businessDesc, filePersonalID, fileCitizenID, personalFName, personalLName, personalContact, personalBDay, gender, state, city, mailingStreet, mailingZIP, createSellerEmail, createSellerPassword } = req.body;

    const parsedPersonalID = JSON.parse(filePersonalID);
    const parsedCitizenshipID = JSON.parse(fileCitizenID);

    if (parsedPersonalID != null && imageMimeTypes.includes(parsedPersonalID.type) && parsedCitizenshipID != null && imageMimeTypes.includes(parsedCitizenshipID.type)) {

        const convertedImgPersonalID = parsedPersonalID.data;
        const imgTypePersonalID = parsedPersonalID.type;

        const convertedCitizenshipID = parsedCitizenshipID.data;
        const imgTypeCitizenshipID = parsedCitizenshipID.type;

        try {
            adminAuth.createUser({
                email: createSellerEmail,
                password: createSellerPassword
    
            }).then(async(userRecord) => {

                await setDoc(doc(db, 'Accounts', `seller_${userRecord.uid}`), {
                    id: userRecord.uid,
                    accRole: "Seller",
                    sellerType: sellerType,
                    accStatus: "Active",
                    createdAt: date.format(now, 'MMM DD, YYYY hh:mm A [GMT]Z'),
                    displayName: '',
                    email: userRecord.email,
                    imgType: '',
                    isVerified: userRecord.emailVerified,
                    profileUpdatedAt: '',
                    signedInAt: date.format(now, 'MMM DD, YYYY hh:mm A [GMT]Z'),
                    signedOutAt: '',
                    userPhoto: ''
                });

                await setDoc(doc(db, 'Sellers', userRecord.uid), {
                    birthday: personalBDay,
                    contactNo: personalContact,
                    displayName: '',
                    email: userRecord.email,
                    fullName: `${personalFName} ${personalLName}`,   
                    gender: gender,
                    city: city,
                    state: state,
                    streetAddress: mailingStreet,
                    ZIP: mailingZIP
                });
    
                await setDoc(doc(db, 'Sellers', userRecord.uid, 'Business Information', businessName), {
                    Name: businessName,
                    Description: businessDesc
                });
        
                await setDoc(doc(db, 'Sellers', userRecord.uid, 'Business Documents', 'Personal ID'), {
                    imgType: imgTypePersonalID,
                    docPhoto: convertedImgPersonalID 
                });
        
                await setDoc(doc(db, 'Sellers', userRecord.uid, 'Business Documents', 'Citizenship ID'), {
                    imgType: imgTypeCitizenshipID,
                    docPhoto: convertedCitizenshipID
                });

                await setDoc(doc(db, 'Stripe Accounts', `seller_${userRecord.uid}`), {
                    customerID: '',
                    subscriptionID: '',
                    isNew: true
                });

                await setDoc(doc(db, 'Stripe Accounts', `seller_${userRecord.uid}`, 'Services', 'Subscription'), {
                    sellerType: '',
                    subscriptionCreated: '',
                    currentSubscriptionBill: '',
                    nextSubscriptionBill: ''
                });

                console.log(`Successfully created new seller: ${userRecord.uid}`);
                             
                res.redirect('/sellercenter');

            }).catch(error => {
                console.error(`Error creating seller: ${error.message}`);
            });
    
        } catch (error) {
            console.log(error);
        };
    };
    
};

 const sessionLoginSeller = (req, res) => {

    // get the idToken passed from client side.
    const idToken = req.query.token.toString();

    // session expires in 5hrs.
    const expiresIn = 60 * 60 * 5 * 1000;

    // create a new session if idToken is valid.
    adminAuth.createSessionCookie(idToken, {expiresIn}).then((sessionCookie) => {
        const options = { maxAge: expiresIn, httpOnly: true, secure: true };
        res.cookie('session', sessionCookie, options);
        res.redirect('/sellercenter')

    }).catch((error) => {

        // throw a error if idToken is not valid.
        console.error(error);
        res.status(404).send('UNAUTHORIZED REQUEST!');
    });
 };

/**
 * SECTION: End of Seller Section
*/



/**
 * SECTION: Start of Global Auth REST APIs
 */

 

 const passwordResetRoute = (req, res) => {
    res.render('auth/reset', {
        errorMessage: ''
    });
 };

 const passwordReset = (req, res) => {
    const email = req.body.email;

    sendPasswordResetEmail(auth, email).then(() => {
        res.render('auth/reset', {
            message: 'Password Reset Email Sent!'
        });
    }).catch((error) => {
        const errorMess = error.message;
        console.error(errorMess);
    });
 };

 const customerLogout = (req, res) => {
    res.clearCookie('session');
    res.redirect('/customercenter/auth')
    console.log('Successfully Logged out');       
 };

 const sellerLogout = async (req, res) => {

    try {
        const stripeAccRef = doc(db, 'Stripe Accounts', `seller_${currentLoggedInUID[0]}`);
        const stripeAccData = await getDoc(stripeAccRef);

        if (stripeAccData.data().isNew) {
            await setDoc(doc(db, 'Stripe Accounts', `seller_${currentLoggedInUID[0]}`), {
                isNew: false
            }, {merge: true});
        }
        res.clearCookie('session');
        res.redirect('/sellercenter/auth')

        console.log(`Successfully Logged out Seller ${currentLoggedInUID[0]}`);

    } catch (error) {
        console.error(error);
    } 
 };

/**
 * SECTION: End of Global REST APIs
*/



/**
 * SECTION: Start of Customer and Seller Functions
 */

 function verifyCookieCustomer(req, res, next) {
    const sessionCookie = req.cookies.session;

    try {
        adminAuth.verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
            req.body.uid = decodedClaims.uid;
            req.body.user = decodedClaims.firebase;
            console.log(`Customer Successfully SignedIn: ${decodedClaims.uid}`);
            return next();

        }).catch((error) => {
            console.error(error);
        });

    } catch (error) {
        res.redirect('/customercenter/auth');
    }
 };

 function verifyCookieSeller(req, res, next) {
    try {
        const sessionCookie = req.cookies.session;

        adminAuth.verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
            currentLoggedInUID.push(decodedClaims.uid)
            req.body.uid = decodedClaims.uid;
            req.body.user = decodedClaims.firebase;
            console.log(`Seller Successfully SignedIn: ${decodedClaims.uid}`);
            return next();

        }).catch((error) => {
            console.error(error);
        });

    } catch (error) {
        res.redirect('/sellercenter/auth');
    }
 };

/**
 * SECTION: End of Customer and Seller Functions
*/


export { 
    signInAndSignUpRoute,
    sellerSignInAndSignUpRoute,
    signUp,
    sellerSignUp,
    sessionLoginCustomer,
    sessionLoginSeller,
    verifyCookieCustomer,
    verifyCookieSeller,
    customerLogout,
    sellerLogout,
};