import express from 'express';
const router = express.Router();

import {
    dashboardPage,
    productPage,
    transactionPage,
    reportPage,
    settingsPage,
    updateProfile,

    liveSession,

} from '../controllers/Controller_Seller.js';

import {
    sellerSignInAndSignUpRoute,
    sellerSignUp,
    sessionLoginSeller,
    verifyCookieSeller,
    sellerLogout
} from '../controllers/Controller_Auth.js';

import {
    subscriptionSuccess,
    stripeCheckoutSession
} from '../controllers/Controller_Stripe.js';

//ANCHOR: All GET Request

//? SignIn and SignUp Route
router.get('/auth', sellerSignInAndSignUpRoute);

//? Register Seller
router.post('/', sellerSignUp);

//? Creates a new session cookie when user sign in.
router.get('/auth/sessionLogin', sessionLoginSeller);

//? Clears session cookie and logout.
router.get('/auth/logout', sellerLogout);

//? Check the user session cookie > direct to dashboard
router.get('/', verifyCookieSeller, dashboardPage);

router.get('/subscription_success/:id', subscriptionSuccess);


router.get('/products', verifyCookieSeller, productPage)


router.get('/transactions', verifyCookieSeller, transactionPage)


router.get('/reports', verifyCookieSeller, reportPage)



router.get('/settings', verifyCookieSeller, settingsPage)

//? Settings: Update User Account 
router.post('/settings', updateProfile)

//! ---------------------------------------------------------------- 
//                       Live Selling
//! ----------------------------------------------------------------

router.get('/live/room/:roomId', verifyCookieSeller, liveSession);

//? Live Selling Checkout
router.post('/create-checkout-session', stripeCheckoutSession);



export { router as routes }