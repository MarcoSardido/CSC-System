import userData from '../_PartialFunctions/userData.js';


export const setting = (req, res) => {
    const uid = req.body.uid;

    try {
        userData(uid).then(result => {
            res.render('customer/settings', {
                layout: 'layouts/customerLayout',
                displayAccountInfo: result.accountArray,
                displayCustomerInfo: result.customerArray,
                messageCode: '',
                infoMessage: '',
                onLive: false,
            });
        })


    } catch (error) {
        console.error(`Customer Controller Error -> @settingsPage: ${error.message}`)
    }
}