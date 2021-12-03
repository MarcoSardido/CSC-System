import express from 'express';
const router = express.Router();

import { sellerDash } from'../controllers/Controller_Seller.js';
import { sellerSignInAndSignUpRoute, sellerSignUp, sessionLoginSeller, verifyCookieSeller, sellerLogout } from '../controllers/Controller_Auth.js';
import { subscriptionSuccess, stripeCheckoutSession } from '../controllers/Controller_Stripe.js';

//ANCHOR: All GET Request

router.get('/auth', sellerSignInAndSignUpRoute); //display sign in and sign up.

router.get('/auth/sessionLogin', sessionLoginSeller); //creates a new session cookie when user sign in.

router.get('/', verifyCookieSeller, sellerDash); //check the user session cookie.

router.get('/auth/logout', sellerLogout); //clears session cookie and logout.

router.get('/subscription_success/:id', subscriptionSuccess);

//SECTION: Side Nav GET Request

router.get('/dashboard', (req, res) => {

    res.render('seller/manageDashboard', {
        title: 'dashboard',
        layout: 'layouts/sellerLayout', 
        messageCode: '',
        infoMessage: '',
        verification: '',
        user: '',
        hasSubscription: true,
        subSuccess: '',
        subUpdateSuccess: '',
        sellerInfo: ''
    })
})

router.get('/reports', (req, res) => {

    res.render('seller/manageReport', {
        title: 'report',
        layout: 'layouts/sellerLayout', 
        verification: '',
        user: '',
        hasSubscription: true,
        subSuccess: '',
        subUpdateSuccess: '',
        sellerInfo: ''
    })
})

router.get('/products', (req, res) => {

    res.render('seller/manageProduct', {
        title: 'report',
        layout: 'layouts/sellerLayout', 
        verification: '',
        user: '',
        hasSubscription: true,
        subSuccess: '',
        subUpdateSuccess: '',
        sellerInfo: ''
    })
})

router.get('/transactions', (req, res) => {

    res.render('seller/manageTransaction', {
        title: 'report',
        layout: 'layouts/sellerLayout', 
        verification: '',
        user: '',
        hasSubscription: true,
        subSuccess: '',
        subUpdateSuccess: '',
        sellerInfo: ''
    })
})

router.get('/settings', (req, res) => {

    res.render('seller/settings', {
        title: 'report',
        layout: 'layouts/sellerLayout', 
        verification: '',
        user: '',
        hasSubscription: true,
        subSuccess: '',
        subUpdateSuccess: '',
        sellerInfo: ''
    })
})





//ANCHOR: All POST Request

router.post('/', sellerSignUp); //creates new account

router.post('/create-checkout-session', stripeCheckoutSession);

export { router as routes }