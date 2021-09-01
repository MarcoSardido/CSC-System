const express = require('express');
const router = express.Router();

const {
    loginRoute
} = require('../controllers/login');

router.get('/', loginRoute);

module.exports = {
    routes: router
}