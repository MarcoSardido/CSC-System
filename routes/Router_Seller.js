import express from 'express';
const router = express.Router();

import {
    signInAndSignUpRoute,
    logout,
    signUp,
    sessionLogin,
    verifyCookie
} from '../controllers/Seller/Auth/Controller_Auth.js';

import { dashboard } from '../controllers/Seller/Dashboard/Controller_Dashboard.js';
import { product } from '../controllers/Seller/Product/Controller_Product.js';
import { report } from '../controllers/Seller/Report/Controller_Report.js';
import { transaction } from '../controllers/Seller/Transaction/Controller_Transaction.js';
import { settings } from '../controllers/Seller/Setting/Controller_Setting.js';
import { updateProfile } from '../controllers/Seller/Setting/Controller_UpdateProfile.js';

import { liveSession } from '../controllers/LiveSelling/Seller/Controller_LiveSelling.js';


import {
    subscriptionSuccess,
    stripeCheckoutSession
} from '../controllers/Stripe/Controller_Stripe.js';


 

//? SignIn and SignUp Route
router.get('/auth', signInAndSignUpRoute);

//? Register Seller
router.post('/', signUp);

//? Creates a new session cookie when user sign in.
router.get('/auth/sessionLogin', sessionLogin);

//? Clears session cookie and logout.
router.get('/auth/logout', logout);

//? Check the user session cookie > direct to dashboard
router.get('/', verifyCookie, dashboard);

router.get('/subscription_success/:id', subscriptionSuccess);


router.get('/products', verifyCookie, product)


router.get('/transactions', verifyCookie, transaction)


router.get('/reports', verifyCookie, report)



router.get('/settings', verifyCookie, settings)

//? Settings: Update User Account 
router.post('/settings', updateProfile)

//! ---------------------------------------------------------------- 
//                       Live Selling
//! ----------------------------------------------------------------

router.get('/live/room/:roomId', verifyCookie, liveSession);

//? Live Selling Checkout
router.post('/create-checkout-session', stripeCheckoutSession);



export { router as routes }