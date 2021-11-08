import express from 'express';
const router = express.Router();

import { sellerDash } from'../controllers/Controller_Seller.js';
import { sellerSignInAndSignUpRoute, sellerSignUp, sessionLoginSeller, verifyCookieSeller, sellerLogout } from '../controllers/Controller_Auth.js';
import { subscriptionSuccess, stripeCheckoutSession } from '../controllers/Controller_Stripe.js';

//--ANCHOR: All GET Request--//

router.get('/auth', sellerSignInAndSignUpRoute); //display sign in and sign up.

router.get('/auth/sessionLogin', sessionLoginSeller); //creates a new session cookie when user sign in.

router.get('/', verifyCookieSeller, sellerDash); //check the user session cookie.

router.get('/auth/logout', sellerLogout); //clears session cookie and logout.

router.get('/subscription_success/:id', subscriptionSuccess)


//--ANCHOR: All POST Request--//

router.post('/', sellerSignUp); //creates new account

router.post('/create-checkout-session', stripeCheckoutSession);

export { router as routes }