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
import { product, getProduct, getReviews } from '../controllers/Seller/Product/Controller_Product.js';
import { report } from '../controllers/Seller/Report/Controller_Report.js';
import { transaction } from '../controllers/Seller/Transaction/Controller_Transaction.js';
import { settings } from '../controllers/Seller/Setting/Controller_Setting.js';
import { updateProfile } from '../controllers/Seller/Setting/Controller_UpdateProfile.js';

import { liveSession } from '../controllers/LiveSelling/Seller/Controller_LiveSelling.js';


import {
    subscriptionSuccess,
    stripeCheckoutSession
} from '../controllers/Stripe/Controller_Stripe.js';


 
router.get('/auth', signInAndSignUpRoute); //? SignIn and SignUp Route
router.post('/', signUp); //? Register Seller
router.get('/auth/sessionLogin', sessionLogin); //? Creates a new session cookie when user sign in.
router.get('/auth/logout', logout); //? Clears session cookie and logout.

//* ================= Dashboard ================= *//
router.get('/', verifyCookie, dashboard); //? Check the user session cookie -> direct to dashboard

//* ================= Subscription ================= *// 
router.post('/create-checkout-session', stripeCheckoutSession);
router.get('/subscription_success/:id', subscriptionSuccess);

//* ================= Products ================= *// 
router.get('/products', verifyCookie, product);
router.get('/products/:id', verifyCookie, getProduct)
router.get('/products/:id/reviews', verifyCookie, getReviews)

//* =============== Transaction =============== *// 
router.get('/transactions', verifyCookie, transaction);

//* ================= Reports ================= *// 
router.get('/reports', verifyCookie, report);

//* ================= Settings ================= *// 
router.get('/settings', verifyCookie, settings);
router.post('/settings', updateProfile); //? Settings: Update User Account 

//* ================= Live Selling ================= *// 
router.get('/live/room/:roomId', verifyCookie, liveSession);


export { router as routes }