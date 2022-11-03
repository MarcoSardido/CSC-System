import { firebase } from '../../../firebaseConfig.js';
import { getFirestore, doc, collection, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase);

const getAllCustomerAddress = async (uid) => {
    const addressList = [];

    try {
        // Customer collection
        const customerColRef = collection(db, `Customers/${uid}/AddressBook`);
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
        const customerColRef = collection(db, `Customers/${uid}/AddressBook`);
        const customerColDoc = await getDocs(customerColRef);

        const addressCounter = customerColDoc.docs.length + 1;

        const addressColRef = doc(db, `Customers/${uid}/AddressBook/address${addressCounter}`);
        await setDoc(addressColRef, {
            name: addressObj.name,
            phone: addressObj.phone,
            barangay: addressObj.barangay,
            city: addressObj.city,
            street: addressObj.home,
            province: addressObj.province,
            type: addressObj.type,
            postal: addressObj.postal,
        });

        return addressObj;
    } catch (error) {
        console.error(`Firestore Error: @addNewAddress -> ${error.message}`)
    }
}

const calcItems = async (uid, sid, arrayOfItems, payment) => {
    const items = [];
    
    try {
        for (const itemIndex of arrayOfItems.itemsArray) {
            const liveCartSubColRef = doc(db, `LiveSession/sessionID_${sid}/sessionUsers/${uid}/LiveCart/${itemIndex}`);
            const liveCartSubColDoc = await getDoc(liveCartSubColRef);

            const priceInCents = liveCartSubColDoc.data().itemPrice.toString();
            items.push({
                id: liveCartSubColDoc.id,
                image: payment === 'STRIPE' ? '' : liveCartSubColDoc.data().itemImg,
                productID: liveCartSubColDoc.data().prodID,
                name: liveCartSubColDoc.data().itemName,
                color: liveCartSubColDoc.data().itemColor,
                description: liveCartSubColDoc.data().itemDesc,
                quantity: liveCartSubColDoc.data().itemQty,
                priceInCents: Number(priceInCents),
                subTotal: (Number(priceInCents) * liveCartSubColDoc.data().itemQty),
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


const codPaymentHandler = async (uid, roomID, data, items, isAnonymousBuyer) => {
    const orderUniqueID = generateId(), transUniqueID = generateId();
    let totalPrice = 0, roomHost;

    //? To remove items later...
    const removeItemsArray = []
    for (const itemIndex of items) {
        removeItemsArray.push(itemIndex.id)

        delete itemIndex.id;

        totalPrice += itemIndex.subTotal;
    }

    try {
        // :: Live Selling -> Customer Live Cart
        const liveCartRef = collection(db, `LiveSession/sessionID_${roomID}/sessionUsers/${uid}/LiveCart`);
        const liveCartDoc = await getDocs(liveCartRef);
        liveCartDoc.forEach(document => {
            removeItemsArray.map(item => {
                if (document.id === item) {

                    //Remove items in live 
                    const removeCartItem = doc(db, `LiveSession/sessionID_${roomID}/sessionUsers/${uid}/LiveCart/${document.id}`);
                    deleteDoc(removeCartItem);
                }
            })
        })

        // :: Live Selling => Get sellerUID
        const liveSessionRef = doc(db, `LiveSession/sessionID_${roomID}`);
        const liveSessionDoc = await getDoc(liveSessionRef);
        roomHost = liveSessionDoc.data().sellerID;

        // :: Customer Collection
        const customerRef = doc(db, `Customers/${uid}`);
        const customerDoc = await getDoc(customerRef);

        // :: Seller Collection -> Live Sessions
        const sellerRef = doc(db, `Sellers/${roomHost}/LiveSessions/sessionID_${roomID}`);
        const sellerDoc = await getDoc(sellerRef);

        // :: Seller Collection -> Transaction
        const sellerTransactionRef = doc(db, `Sellers/${roomHost}/Transactions/transactionID_${transUniqueID}`);
        await setDoc(sellerTransactionRef, {
            id: transUniqueID,
            orderID: orderUniqueID,
            customer: {
                uid: customerDoc.id,
                address: data.orderAddress,
                name: isAnonymousBuyer === 'true' ? 'Anonymous Buyer' : customerDoc.data().displayName,
                phone: customerDoc.data().contactNo,
                checkoutName: `${data.fName} ${data.lName}`,
                checkoutPhone: data.contactNo,
            },
            items: items,
            date: stringDateFormat(),
            payment: data.modeOfPayment,
            status: 'Pending',
            totalPrice: totalPrice
        })

        // :: Customer Collection -> Orders
        const customerOrderRef = doc(db, `Customers/${uid}/Orders/orderID_${orderUniqueID}`);
        await setDoc(customerOrderRef, {
            id: orderUniqueID,
            transactionID: transUniqueID,
            seller: {
                uid: roomHost,
                storeName: sellerDoc.data().roomName
            },
            items: items,
            modeOfPayment: data.modeOfPayment,
            placedOn: stringDateFormat(),
            shippedOn: '',
            deliveredOn: '',
            totalAmount: totalPrice,
            orderAddress: data.orderAddress,
            status: 'Processing',
        })

    } catch (error) {
        console.error(`Firestore Error: @codPaymentHandler -> ${error.message}`);
    }
}


//* =================================================================================================== 
// ========================================== Stripe ==================================================
//* ===================================================================================================
const stripePaymentHandler = async (uid, userObj, itemArr, paymentMethod, isAnonymousBuyer) => {

    try {
        const stripeResult = await fetch(window.location.href, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                currentUrl: window.location.href.split("?")[0],
                isAnonymous: isAnonymousBuyer,
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

const generateId = () => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 15; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

const stringDateFormat = () => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    }).replace(/ /g, ' ');
    return formattedDate;
}




export {
    getAllCustomerAddress,
    addNewAddress,
    calcItems,

    stripePaymentHandler,
    codPaymentHandler
}