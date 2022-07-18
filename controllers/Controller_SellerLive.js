const liveSession = async (req, res) => {

    //* TODO: Make array in db on every customer entered the live room and
    //*       to count all customers and use that as viewers

    res.render('seller/liveSelling', {
        layout: 'layouts/sellerLayout',
        hasSubscription: true,
        verification: '',
        subSuccess: '',
        subUpdateSuccess: '',
        sellerInfo: '',
    })
}

export {
    liveSession,
}