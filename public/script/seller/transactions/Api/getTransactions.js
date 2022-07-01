import { firebase } from '../../../firebaseConfig.js';
import { getFirestore, doc, collection, getDocs, getDoc, query, orderBy, where } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";
const db = getFirestore(firebase)

const getAllTransactionRecords = async (uuid) => {
    const transactionContainer = [];

    try {
        const collectionRef = collection(db, `Sellers/${uuid}/Transactions`);
        const transactionCollection = await getDocs(collectionRef);

        transactionCollection.forEach(record => transactionContainer.push(record.data()));
        return transactionContainer;
    } catch (err) {
        console.error(`Firestore Error: @Get all transactions records -> ${err.message}`)
    }
}

const dataForAnalytics = async (uuid) => {
    const analyticsContainer = [];

    try {
        const collectionRef = collection(db, `Sellers/${uuid}/Transactions`);
        const filter = query(collectionRef, orderBy('date'));
        const transactionCollection = await getDocs(filter);

        transactionCollection.forEach(record => analyticsContainer.push({
            date: record.data().date,
            totalPrice: record.data().totalPrice,
        }));
        
        return analyticsContainer;
    } catch (err) {
        console.error(`Firestore Error: @Get data for analytics -> ${err.message}`)
    }
}






export {
    getAllTransactionRecords,
    dataForAnalytics,
}