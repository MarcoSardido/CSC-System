export const liveSession = async (req, res) => {
    res.render('seller/liveSelling', {
        layout: 'layouts/sellerLayout',
        hasSubscription: true,
        verification: '',
        subSuccess: '',
        subUpdateSuccess: '',
        sellerInfo: '',
        isSelling: true,
    })
}