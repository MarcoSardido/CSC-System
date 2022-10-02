import express from 'express';
const router = express.Router();

import { dashboard } from '../controllers/Customer/Dashboard/Controller_Dashboard.js';
import { order } from '../controllers/Customer/Order/Controller_Order.js';
import { orderStatus } from '../controllers/Customer/Order/Controller_OrderStatus.js';
import { review } from '../controllers/Customer/Review/Controller_Review.js';
import { setting } from '../controllers/Customer/Setting/Controller_Setting.js';
import { updateProfileData, updateProfilePhoto } from '../controllers/Customer/Setting/Controller_UpdateProfile.js';
import { addNewAddress, getAddress } from '../controllers/Customer/Setting/Controller_Address.js'

import {
    liveSession,
    marketPlace,
    livePayment,
    livePaymentSuccess
} from '../controllers/LiveSelling/Customer/Controller_LiveSelling.js';


import {
    signInAndSignUpRoute,
    logout,
    signUp,
    sessionLogin,
    verifyCookie
} from '../controllers/Customer/Auth/Controller_Auth.js';


//! ---------------------------------------------------------------- 
//                       Auth
//! ----------------------------------------------------------------

// Register
router.get('/auth', signInAndSignUpRoute);
router.post('/auth', signUp);

// Login
router.get('/auth/sessionLogin', sessionLogin);

// Logout
router.get('/auth/logout', verifyCookie, logout);

//! ---------------------------------------------------------------- 
//                       Pages
//! ----------------------------------------------------------------

// Dashboard Page
router.get('/', verifyCookie, dashboard);


// Order Page
router.get('/orders', verifyCookie, order);
router.get('/orders/orderstatus/:id?', verifyCookie, orderStatus)

// Review Page
router.get('/reviews', verifyCookie, review);


// Settings Page
router.get('/settings', verifyCookie, setting);
router.post('/settings/updateData', verifyCookie, updateProfileData);
router.post('/settings/updatePhoto', verifyCookie, updateProfilePhoto);
router.post('/settings/addAddress', verifyCookie, addNewAddress);
router.post('/settings/getAddress', verifyCookie, getAddress);

//! ---------------------------------------------------------------- 
//                       Live Selling
//! ----------------------------------------------------------------

// Main Page
router.get('/live/room/:roomId', verifyCookie, liveSession);

// Stripe Handle Payment
router.post('/live/room/:roomId', verifyCookie, livePayment);

// Stripe Payment Success Page 
router.get('/live/room/:roomId/success', verifyCookie, livePaymentSuccess);

//! ---------------------------------------------------------------- 
//                       Market Place
//! ----------------------------------------------------------------

// Main Page
router.get('/marketplace/room/:roomId', verifyCookie, marketPlace);

// Stripe Handle Payment
router.post('/marketplace/room/:roomId', verifyCookie, livePayment);

// Stripe Payment Success Page 
router.get('/marketplace/room/:roomId/success', verifyCookie, livePaymentSuccess);

export { router as routes }