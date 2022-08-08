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

        const addressCounter = customerColDoc.docs.length+1;

        const addressColRef = doc(db, `Customers/${uid}/CustomerAddressBook/address${addressCounter}`);
        const newAddress = await setDoc(addressColRef, {
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

const calcItemsPrice = async (uid, sid, arrayOfItems) => {
    let totalItemsPrice = 0;

    try {
        for (const itemIndex of arrayOfItems) {
            const liveCartSubColRef = doc(db, `LiveSession/sessionID_${sid}/sessionUsers/${uid}/LiveCart/${itemIndex}`);
            const liveCartSubColDoc = await getDoc(liveCartSubColRef);
            
            totalItemsPrice += liveCartSubColDoc.data().itemTotal;
        }
        return totalItemsPrice;

    } catch (error) {
        console.error(`Firestore Error: @calcItemsPrice -> ${error.message}`)
    }
}

export {
    getAllCustomerAddress,
    addNewAddress,
    calcItemsPrice
}