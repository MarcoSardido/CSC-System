'use strict';

import { firebase, firebaseAdmin } from '../firebase.js';
import { getAuth, sendPasswordResetEmail} from  'firebase/auth';

const adminAuth = firebaseAdmin.auth();
const auth = getAuth(firebase);


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
                
            res.render('authentication/auth', {
                title: 'City Sales Cloud',
                layout: 'layouts/customer_authLayout',
                messageCode: 'alert-info',
                infoMessage: 'Login with same credentials'
            });

        }).catch((error) => {
            console.error(error);
            const errorMessage = error.message;

            res.render('authentication/auth', {
                title: 'City Sales Cloud',
                layout: 'layouts/customer_authLayout',
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

 const logout = (req, res) => {
       
    res.clearCookie('session');
    res.redirect('/customercenter/auth')
    console.log('Successfully Logged out');       
 };

/**
 * SECTION: End of Global REST APIs
*/



/**
 * SECTION: Start of Customer and Seller Functions
 */

 function verifyCookieCustomer(req, res, next) {
    try {
        const sessionCookie = req.cookies.session;

        adminAuth.verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
            req.body.uid = decodedClaims.uid;
            req.body.user = decodedClaims.firebase;
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
            req.body.uid = decodedClaims.uid;
            req.body.user = decodedClaims.firebase;
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
    sessionLoginCustomer,
    sessionLoginSeller,
    verifyCookieCustomer,
    verifyCookieSeller,
    logout
};