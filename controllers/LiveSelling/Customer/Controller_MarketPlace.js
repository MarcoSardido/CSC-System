import userData from '../../Customer/_PartialFunctions/userData.js';


export const marketPlace = (req, res) => {
    const { uid } = req.body;

    try {
        userData(uid).then(result => {
            res.render('customer/marketPlace', {
                layout: 'layouts/customerLayout',
                displayAccountInfo: result.accountArray,
                displayCustomerInfo: result.customerArray,
                onLive: true,
                messageCode: '',
                infoMessage: '',
            });
        })
    } catch (error) {
        console.error(`Controller MarketPlace Error: ${error.message}`)
    }
}