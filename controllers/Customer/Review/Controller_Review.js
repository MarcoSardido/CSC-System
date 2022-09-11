import userData from '../_PartialFunctions/userData.js';

export const review = (req, res) => {
    const uid = req.body.uid;

    try {
        userData(uid).then(result => {
            res.render('customer/review', {
                layout: 'layouts/customerLayout',
                displayAccountInfo: result.accountArray,
                displayCustomerInfo: result.customerArray,
                messageCode: '',
                infoMessage: '',
                onLive: false,
            });
        })

    } catch (error) {
        console.error(`Customer Controller Error -> @reviewPage: ${error.message}`)
    }
}