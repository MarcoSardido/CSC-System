import { firebase } from '../../../firebaseConfig.js';
import { getFirestore, doc, collection, getDocs, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase);

const getAllOrders = async (uid) => {
    const ordersArray = [];

    try {
        //* CUSTOMER COLLECTION -> SUB-COLLECTION: Orders
        const customerOrderColRef = collection(db, `Customers/${uid}/Orders`);
        const customerOrderCollection = await getDocs(customerOrderColRef);

        customerOrderCollection.forEach(order => ordersArray.push(order.data()));

        return ordersArray;

    } catch (error) {
        console.error(`Firestore Error: @getAllOrders -> ${error.message}`)
    }
}

export {
    getAllOrders,
}