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

export {
    getAllCustomerAddress
}