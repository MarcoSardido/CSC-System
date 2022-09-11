import { firebase } from '../../../firebase.js';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

import userData from '../_PartialFunctions/userData.js';
import ntc from '@yatiac/name-that-color';

const db = getFirestore(firebase);

export const orderStatus = async (req, res) => {
    const { uid } = req.body;
    const { id } = req.query;

    try {
        //* CUSTOMER COLLECTION
        const customerColRef = doc(db, `Customers/${uid}`);
        const customerDocument = await getDoc(customerColRef);

        //* CUSTOMER COLLECTION: Sub-collection: Orders
        const orderColRef = doc(db, `Customers/${uid}/Orders/orderID_${id}`);
        const orderDocument = await getDoc(orderColRef);

        const orderItems = orderDocument.data().items;

        for (const [itemIndex, itemValue] of orderItems.entries()) {
            let getComponent = itemValue.color.substring(4, itemValue.color.length - 1).replace(/ /g, '').split(',');
            let hexValue = rgbToHex(getComponent[0], getComponent[1], getComponent[2]);
            let colorName = ntc(`#${hexValue}`).colorName;
            orderItems[itemIndex].subTotal = formatThousands(orderItems[itemIndex].subTotal / 100) + '.00';
            orderItems[itemIndex].colorName = colorName;
        }
        
        let orderItem = {
            id: orderDocument.data().id,
            placedOn: convertStringDateToNumDate(orderDocument.data().placedOn),
            shippedOn: orderDocument.data().shippedOn !== '' ? convertStringDateToNumDate(orderDocument.data().shippedOn) : '',
            deliveredOn :orderDocument.data().deliveredOn !== '' ? convertStringDateToNumDate(orderDocument.data().deliveredOn) : '',
            status: orderDocument.data().status,
            customer: {
                name: customerDocument.data().displayName,
                contactNo: customerDocument.data().contactNo
            },
            orderAddress: orderDocument.data().orderAddress,
            items: orderItems,
            totalAmount: formatThousands(orderDocument.data().totalAmount / 100) + '.00',
            modeOfPayment: orderDocument.data().modeOfPayment === 'COD' ? 'Cash On Delivery' : 'Credit Card'
        }

        userData(uid).then(result => {
            res.render('customer/orderStatus', {
                layout: 'layouts/customerLayout',
                uid: res.locals.uid,
                displayAccountInfo: result.accountArray,
                displayCustomerInfo: result.customerArray,
                displayOrderInfo: orderItem,
                messageCode: '',
                infoMessage: '',
                onLive: false,
            });
        })

    } catch (error) {
        console.error(`Customer Controller Error -> @orderStatusPage: ${error.message}`);
    }
}

const convertStringDateToNumDate = (strDate) => {
    let stringDate = strDate.split(" ");
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let j = 0; j < months.length; j++) {
        if (stringDate[1] == months[j]) {
            stringDate[1] = months.indexOf(months[j]) + 1;
        }
    }
    if (stringDate[1] < 10) {
        stringDate[1] = '0' + stringDate[1];
    }
    if (stringDate[0] < 10) {
        stringDate[0] = '0' + stringDate[0];
    }
    let result = `${stringDate[1]}/${stringDate[0]}/${stringDate[2]}`;
    return result;
}

const rgbToHex = (r, g, b) => {
    let rgb = b | (g << 8) | (r << 16);
    return (0x1000000 | rgb).toString(16).substring(1);
}

const formatThousands = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}