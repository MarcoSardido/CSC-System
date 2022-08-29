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
router.get('/auth', signInAndSignUpRoute);
router.get('/auth/sessionLogin', sessionLoginCustomer);
router.post('/auth', signUp);
router.get('/auth/logout', customerLogout);

//! ---------------------------------------------------------------- 
//                       Pages
//! ----------------------------------------------------------------
router.get('/', verifyCookieCustomer, customerDash);



router.get('/orders', verifyCookieCustomer, orderPage);
router.get('/orders/orderstatus/:id?', verifyCookieCustomer, orderStatusPage)


router.get('/reviews', verifyCookieCustomer, reviewPage);



router.get('/settings', verifyCookieCustomer, settingsPage);
router.post('/', profileUpdate);


//! ---------------------------------------------------------------- 
//                       Live Selling
//! ----------------------------------------------------------------
router.get('/live/room/:roomId', verifyCookieCustomer, liveSession);
router.post('/live/room/:roomId', verifyCookieCustomer, livePayment);
router.get('/live/room/:roomId/success', verifyCookieCustomer, livePaymentSuccess);








export { router as routes }