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





//! ---------------------------------------------------------------- 
//                       Live Selling
//! ----------------------------------------------------------------

router.get('/live', verifyCookieSeller, liveSession);





//ANCHOR: All POST Request

router.post('/', sellerSignUp); //creates new account

router.post('/create-checkout-session', stripeCheckoutSession);

//? Settings: Update User Account 
router.post('/settings', updateProfile)

export { router as routes }