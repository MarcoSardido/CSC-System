import express from 'express';
const router = express.Router();

import {
    dashboardPage,
    productPage,
    addProduct,
    transactionPage,
    reportPage,
    settingsPage
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

//? Check the user session cookie > direct to dashboard
router.get('/', verifyCookieSeller, dashboardPage);

//? Clears session cookie and logout.
router.get('/auth/logout', sellerLogout);

router.get('/subscription_success/:id', subscriptionSuccess);

router.get('/products', verifyCookieSeller, productPage)
router.post('/products', addProduct)

router.get('/transactions', verifyCookieSeller, transactionPage)
router.get('/reports', verifyCookieSeller, reportPage)
router.get('/settings', verifyCookieSeller, settingsPage)

// router.get('/settings/:?tab=account', (req, res) => {
//     console.log('nice')
// })

//SECTION: Side Nav GET Request


//ANCHOR: All POST Request

router.post('/', sellerSignUp); //creates new account

router.post('/create-checkout-session', stripeCheckoutSession);

export { router as routes }