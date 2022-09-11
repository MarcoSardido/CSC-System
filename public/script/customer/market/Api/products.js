import { firebase } from '../../../firebaseConfig.js';
import { getFirestore, doc, collection, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase);

const getAllProducts = async (sessionID) => {
    const productsArray = [];

    try {
        //* LIVE SESSION COLLECTION -> SUB-COLLECTION: sessionProducts
        const productsSubColRef = collection(db, `LiveSession/sessionID_${sessionID}/sessionProducts`);
        const productsSubColDoc = await getDocs(productsSubColRef);
        productsSubColDoc.forEach(product => productsArray.push(product.data()))

        return productsArray;
    } catch (error) {
        console.error(`Firestore Error -> @getAllProducts: ${error.message}`)
    }
}

const getFilteredProducts = async (sessionID, productIDs) => {
    const filteredProducts = [];

    try {
        for (const productIndex of productIDs) {
            //* LIVE SESSION COLLECTION -> SUB-COLLECTION: sessionProducts
            const productsSubColRef = doc(db, `LiveSession/sessionID_${sessionID}/sessionProducts/${productIndex}`);
            const productDoc = await getDoc(productsSubColRef);

            filteredProducts.push(productDoc.data())
        }

        return filteredProducts;
        
    } catch (error) {
        console.error(`Firestore Error -> @getFilteredProducts: ${error.message}`)
    }
}

export {
    getAllProducts,
    getFilteredProducts
}