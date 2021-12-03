import express from 'express';
const router = express.Router();

import { customerDash, profileUpdate } from '../controllers/Controller_Customer.js';
import { signInAndSignUpRoute, sessionLoginCustomer, verifyCookieCustomer, signUp, customerLogout } from '../controllers/Controller_Auth.js';

router.get('/auth', signInAndSignUpRoute);
router.get('/auth/sessionLogin', sessionLoginCustomer);
router.get('/', verifyCookieCustomer, customerDash);
router.post('/auth', signUp);
router.get('/auth/logout', customerLogout);

router.post('/', profileUpdate);

export { router as routes }