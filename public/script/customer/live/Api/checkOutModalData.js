import { firebase } from '../../../firebaseConfig.js';
import { getFirestore, doc, collection, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase);

const getAllCustomerAddress = async (uid) => {
    const addressList = [];

    try {
        // Customer collection
        const customerColRef = collection(db, `Customers/${uid}/CustomerAddressBook`);
        const customerColDoc = await getDocs(customerColRef);

        customerColDoc.forEach(doc => {
            addressList.push(doc.data())
        });

        return addressList;

    } catch (error) {
        console.error(`Firestore Error: @getAllCustomerAddress -> ${error.message}`)
    }
}

const addNewAddress = async (uid, addressObj) => {
    try {
        // Customer collection
        const customerColRef = collection(db, `Customers/${uid}/CustomerAddressBook`);
        const customerColDoc = await getDocs(customerColRef);

        const addressCounter = customerColDoc.docs.length + 1;

        const addressColRef = doc(db, `Customers/${uid}/CustomerAddressBook/address${addressCounter}`);
        await setDoc(addressColRef, {
            Barangay: addressObj.barangay,
            City: addressObj.city,
            HouseOrUnitNo: addressObj.home,
            Province: addressObj.province,
            addressType: addressObj.type,
            zipCode: addressObj.postal,
        });

        return addressObj;
    } catch (error) {
        console.error(`Firestore Error: @addNewAddress -> ${error.message}`)
    }
}

const calcItems = async (uid, sid, arrayOfItems) => {
    const items = [];

    try {
        for (const itemIndex of arrayOfItems) {
            const liveCartSubColRef = doc(db, `LiveSession/sessionID_${sid}/sessionUsers/${uid}/LiveCart/${itemIndex}`);
            const liveCartSubColDoc = await getDoc(liveCartSubColRef);

            let convert = liveCartSubColDoc.data().itemPrice.toString();
            const priceInCents = convert+='00';

            items.push({
                id: liveCartSubColDoc.id,
                name: liveCartSubColDoc.data().itemName,
                quantity:  liveCartSubColDoc.data().itemQty,
                priceInCents: Number(priceInCents),
                size: liveCartSubColDoc.data().itemSize

            })
        }
        return items;

    } catch (error) {
        console.error(`Firestore Error: @calcItems -> ${error.message}`)
    }
}

const addStripePaymentID = async (uid, stripePaymentID, stripePaymentStatus) => {

    try {
        const stripePaymentIntentRef = doc(db, `Stripe Accounts/customer_${uid}/Payment Intents/${stripePaymentID}`);
        await setDoc(stripePaymentIntentRef, {
            paymentIntentID: stripePaymentID,
            paymentIntentStatus: stripePaymentStatus,
        })

    } catch (error) {
        console.error(`Firestore Error: @addStripePaymentID -> ${error.message}`);
    }

}


//* =================================================================================================== 
// ========================================== Stripe ==================================================
//* ===================================================================================================
const stripePaymentHandler = async (uid, userObj, itemArr, paymentMethod) => {

    try {
        const stripeResult = await fetch(window.location.href, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                currentUrl: window.location.href,
                customer: userObj,
                items: itemArr,
                method: paymentMethod
            })
    
        });
        // Result Object
        const jsonResult = await stripeResult.json();

        // Firebase
        addStripePaymentID(uid, jsonResult.paymentID, jsonResult.paymentStatus);

        // Stripe checkout page
        window.location = jsonResult.paymentUrl;

    } catch (error) {
        console.error(`STRIPE ERROR: @stripePaymentHandler -> ${error.message}`)
    }
}








export {
    getAllCustomerAddress,
    addNewAddress,
    calcItems,

    stripePaymentHandler
}