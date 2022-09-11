import userData from '../_PartialFunctions/userData.js';

export const order = (req, res) => {
    const uid = req.body.uid;

    userData(uid).then(result => {
        res.render('customer/order', {
            layout: 'layouts/customerLayout',
            uid: res.locals.uid,
            displayAccountInfo: result.accountArray,
            displayCustomerInfo: result.customerArray,
            messageCode: '',
            infoMessage: '',
            onLive: false,
        });
    })
}