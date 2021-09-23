import express from 'express';
const router = express.Router();

import { signInAndSignUpRoute, signUp, sessionLogin, logout } from '../controllers/Controller_Auth.js';

router.get('/', signInAndSignUpRoute);
router.post('/', signUp);
router.get('/sessionLogin', sessionLogin);
router.get('/logout', logout)

export {
    router as routes
}