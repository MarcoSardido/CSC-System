import express from 'express';
const router = express.Router();

import { customerDash, profileUpdate } from '../controllers/Controller_Customer.js';
import { verifyCookie } from '../controllers/Controller_Auth.js';

router.get('/', verifyCookie, customerDash);
router.post('/', profileUpdate);

export { router as routes}