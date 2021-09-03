const express = require('express');
const router = express.Router();

const {
    sellerDash,
    sellerProduct,
    sellerTransactions,
    sellerReports,
    sellerSettings
} = require('../controllers/seller');

router.get('/', sellerDash);

// router.get('/products', sellerProduct);

// router.get('/transactions', sellerTransactions);

// router.get('/reports', sellerReports);

// router.get('/settings', sellerSettings);

module.exports = {
    routes: router
}