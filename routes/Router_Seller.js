import express from 'express';
const router = express.Router();

import { sellerDash } from'../controllers/Controller_Seller.js';
import { sellerSignInAndSignUpRoute, sessionLoginSeller, verifyCookieSeller } from '../controllers/Controller_Auth.js';

router.get('/auth', sellerSignInAndSignUpRoute);
router.get('/auth/sessionLogin', sessionLoginSeller);
router.get('/', verifyCookieSeller, sellerDash);
// router.post('/', signUp);
// router.get('/auth/logout', logout);

// router.post('/', profileUpdate);
export { router as routes }