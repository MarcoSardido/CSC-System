import express from 'express';
const router = express.Router();

import { customerDash } from '../controllers/Controller_Customer.js';
import { verifyCookie } from '../controllers/Controller_Auth.js';

router.get('/', verifyCookie, customerDash);

export { router as routes}