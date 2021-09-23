'use strict';

import { firebase, firebaseAdmin } from '../firebase.js';

const adminAuth = firebaseAdmin.auth();

const sellerDash = (req, res) => {
    res.render('seller/dashboard', { 

        title: 'Seller Center',
        layout: 'layouts/sellerLayout',
        messageCode: '',
        infoMessage: ''
    });
}

export { sellerDash }