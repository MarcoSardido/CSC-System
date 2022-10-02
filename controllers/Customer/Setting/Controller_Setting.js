import userData from '../_PartialFunctions/userData.js';

import { firebase } from '../../../firebase.js';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const db = getFirestore(firebase);

export const setting = async (req, res) => {
    const uid = req.body.uid;
    const addressesArray = [];

    try {
        //* CUSTOMERS COLLECTION -> SUB-COLLECTION: AddressBook
        const addressSubColRef = collection(db, `Customers/${uid}/AddressBook`);
        const addressSubCollection = await getDocs(addressSubColRef);
        addressSubCollection.forEach(doc => {
            addressesArray.push({
                addressID: doc.id,
                name: doc.data().name,
                phone: doc.data().phone,
                barangay: doc.data().barangay,
                city: doc.data().city,
                street: doc.data().street,
                province: doc.data().province,
                postal: doc.data().postal,
                type: doc.data().type
            })
        })

        userData(uid).then(result => {
            res.render('customer/settings', {
                layout: 'layouts/customerLayout',
                displayAccountInfo: result.accountArray,
                displayCustomerInfo: result.customerArray,
                addressData: addressesArray,
                onLive: false,
            });
        })
    } catch (error) {
        console.error(`Customer Controller Error -> @settingsPage: ${error.message}`)
    }
}