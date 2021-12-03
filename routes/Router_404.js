export default ((req, res) => {
    const currentURL = req.url;

    if (currentURL.slice(1,15) == 'customercenter') {
        res.render('page404', {
            currentPath: '- Customer Center',
        });

    } else if (currentURL.slice(1,13) == 'sellercenter'){
        res.render('page404', {
            currentPath: '- Seller Center',
        });

    } else {
        res.render('page404', {
            currentPath: '',
        });
    };
});