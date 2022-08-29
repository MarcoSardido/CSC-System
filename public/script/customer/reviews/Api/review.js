import { firebase } from '../../../firebaseConfig.js';
import { getFirestore, doc, collection, getDocs, getDoc, setDoc, query, where } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase);

const getOrdersToBeReviewed = async (uid) => {
    const toBeReviewedArray = [];

    try {
        //* CUSTOMER COLLECTION -> SUB-COLLECTION: Orders
        const customerOrderColRef = collection(db, `Customers/${uid}/Orders`);
        const orderReviewQuery = query(customerOrderColRef, where('status', '==', 'Delivered'))
        const customerOrderCollection = await getDocs(orderReviewQuery);
        customerOrderCollection.forEach(reviewOrder => toBeReviewedArray.push(reviewOrder.data()));

        return toBeReviewedArray;

    } catch (error) {
        console.error(`Firestore Error: @getAllOrders -> ${error.message}`)
    }
}

const getAllReviewedOrders = async (uid) => {
    const reviewedArray = [];

    try {
        //* CUSTOMER COLLECTION -> SUB-COLLECTION: Reviews
        const customerReviewsColRef = collection(db, `Customers/${uid}/Reviews`);
        const customerReviewsCollection = await getDocs(customerReviewsColRef);
        customerReviewsCollection.forEach(review => reviewedArray.push(review.data()));

        return reviewedArray;

    } catch (error) {
        console.error(`Firestore Error: @getAllReviewedOrders -> ${error.message}`)
    }
}

export {
    getOrdersToBeReviewed,
    getAllReviewedOrders
}