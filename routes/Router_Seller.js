import express from 'express';
const router = express.Router();

import { sellerDash } from'../controllers/Controller_Seller.js';
import { verifyCookie } from '../controllers/Controller_Auth.js';

router.get('/', verifyCookie, sellerDash);

export { router as routes }