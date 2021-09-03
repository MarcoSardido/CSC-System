'use strict';

const sellerDash = (req, res) => {
    res.render('seller/dashboard', { 

        title: 'Seller Center',
        layout: 'layouts/sellerLayout'
    });
}

const sellerProduct = (req, res) => {
    // res.render('seller/manageProduct', { 

    //     title: 'Seller Center',
    //     layout: 'layouts/sidebar'
    // });
}

const sellerTransactions = (req, res) => {
    // res.render('seller/manageTransaction', { 

    //     title: 'Seller Center',
    //     layout: 'layouts/sidebar'
    // });
}

const sellerReports = (req, res) => {
    // res.render('seller/manageReport', {

    //     title: 'Seller Center',
    //     layout: 'layouts/sidebar'
    // });
}

const sellerSettings = (req, res) => {
    // res.render('seller/settings', {

    //     title: 'Seller Center',
    //     layout: 'layouts/sidebar'
    // });
}

module.exports = {
    sellerDash,
    sellerProduct,
    sellerTransactions,
    sellerReports,
    sellerSettings
}