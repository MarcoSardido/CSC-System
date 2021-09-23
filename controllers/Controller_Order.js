'use strict';

// const {firebaseDB, firebaseAdmin} = require('../firebaseDB');
// const firestore = firebaseDB.firestore();

// const Customer = require('../models/Model_Customer');
// const Order = require('../models/Model_Order');

// const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/PNG'];

// const date = require('date-and-time');

/** 
 *  ORDER APIs
 * 
 * @getOrders
 */

// const getOrders = async (req, res) => {
//     const orderRef = [];
//     const customerRef = [];

//     try {
//         const customerCollectionRef = await firestore.collection('Customers').get();
//         customerCollectionRef.docs.map(doc => {
//             customerRef.push(doc.id);
//         });

//         for(let customerData of customerRef) {
//             const customerOrderSubCollection = await firestore.collection('Customers').doc(customerData)
//                                                               .collection('CustomerOrders')
//         }
//     } catch (error) {
        
//     }
// }

// module.exports = {
    
// }