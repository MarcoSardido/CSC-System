const express = require('express');
const router = express.Router();

const {
    sellerDash
} = require('../controllers/seller');

router.get('/', sellerDash);

module.exports = {
    routes: router
}