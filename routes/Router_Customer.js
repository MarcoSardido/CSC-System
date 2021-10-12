import express from 'express';
const router = express.Router();

import { customerDash, profileUpdate } from '../controllers/Controller_Customer.js';
import { signInAndSignUpRoute, sessionLoginCustomer, verifyCookieCustomer, signUp, logout } from '../controllers/Controller_Auth.js';

router.get('/auth', signInAndSignUpRoute);
router.get('/auth/sessionLogin', sessionLoginCustomer);
router.get('/', verifyCookieCustomer, customerDash);
router.post('/', signUp);
router.get('/auth/logout', logout);

router.post('/', profileUpdate);

export { router as routes }