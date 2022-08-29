import express from 'express';
const router = express.Router();

import { 
    customerDash,

    orderPage,
    orderStatusPage,

    reviewPage,

    settingsPage, 
    profileUpdate,

    liveSession,
    livePayment,
    livePaymentSuccess
} from '../controllers/Controller_Customer.js';

import { 
    signInAndSignUpRoute,
    sessionLoginCustomer,
    verifyCookieCustomer,
    signUp,
    customerLogout
} from '../controllers/Controller_Auth.js';


//! ---------------------------------------------------------------- 
//                       Auth
//! ----------------------------------------------------------------

// Register
router.get('/auth', signInAndSignUpRoute);
router.post('/auth', signUp);

// Login
router.get('/auth/sessionLogin', sessionLoginCustomer);

// Logout
router.get('/auth/logout', customerLogout);

//! ---------------------------------------------------------------- 
//                       Pages
//! ----------------------------------------------------------------

// Dashboard Page
router.get('/', verifyCookieCustomer, customerDash);


// Order Page
router.get('/orders', verifyCookieCustomer, orderPage);
router.get('/orders/orderstatus/:id?', verifyCookieCustomer, orderStatusPage)

// Review Page
router.get('/reviews', verifyCookieCustomer, reviewPage);


// Settings Page
router.get('/settings', verifyCookieCustomer, settingsPage);
router.post('/', profileUpdate);


//! ---------------------------------------------------------------- 
//                       Live Selling
//! ----------------------------------------------------------------

// Live Selling Page
router.get('/live/room/:roomId', verifyCookieCustomer, liveSession);

// Stripe Handle Payment
router.post('/live/room/:roomId', verifyCookieCustomer, livePayment);

// Stripe Payment Success PAge 
router.get('/live/room/:roomId/success', verifyCookieCustomer, livePaymentSuccess);




export { router as routes }