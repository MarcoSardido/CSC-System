'use-strict'

$(document).ready(() => {
    $('#needEmailVerification').modal('show');
    $('#subscriptionSuccess').modal('show');
    $('#subscriptionUpdateSuccess').modal('show');
    
});

function createSubscription(currentSellerID) {
    fetch('sellercenter/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            uid: currentSellerID,
        }),
    }).then(res => {
        if (res.ok) return res.json();
        return res.json().then(json => Promise.reject(json));
    }).then(({ url }) => {
        window.location = url;
    }).catch(err => {
        console.error(err.message);
    });
};