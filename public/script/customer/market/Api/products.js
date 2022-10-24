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

const getProduct = async (sessionID, productID) => {
    const prodObj = {};
    const productReviewArray = [], customerIDArray = [];

    try {
        //* COLLECTION: LiveSession
        const liveSessionDocRef = doc(db, `LiveSession/sessionID_${sessionID}`);
        const liveSessionDocument = await getDoc(liveSessionDocRef);

        //* COLLECTION: LiveSession -> SUB-COLLECTION: sessionProducts
        const productSubColRef = doc(db, `LiveSession/sessionID_${sessionID}/sessionProducts/${productID}`);
        const productDoc = await getDoc(productSubColRef);

        //* COLLECTION: Sellers -> SUB-COLLECTION: Products -> SUB-COLLECTION: Reviews
        const reviewSubColRef = collection(db, `Sellers/${liveSessionDocument.data().sellerID}/Products/${productID}/Reviews`);
        const reviewCollection = await getDocs(reviewSubColRef);
        reviewCollection.forEach(doc => {
            customerIDArray.push(doc.data().customerID);
            productReviewArray.push({
                customer: {
                    uid: doc.data().customerID
                },
                dateReviewed: doc.data().dateReviewed,
                feedBack: doc.data().feedBack,
                id: doc.data().id,
                rate: doc.data().rate
            })
        })

        for (const customerIDIndex of customerIDArray) {
            //* COLLECTION: Accounts
            const accountDocRef = doc(db, `Accounts/customer_${customerIDIndex}`);
            const accountDocument = await getDoc(accountDocRef);

            for (const [productIndex, productValue] of productReviewArray.entries()) {
                if (productValue.customer.uid === customerIDIndex) {
                    productReviewArray[productIndex].customer.picture = `data:${accountDocument.data().imgType};base64,${accountDocument.data().userPhoto}`;
                    productReviewArray[productIndex].customer.displayName = accountDocument.data().displayName;
                }
            }
        }

        prodObj.prodData = productDoc.data();
        prodObj.reviewData = productReviewArray;

        return prodObj;
    } catch (error) {
        console.error(`Firestore Error -> @getProduct: ${error.message}`)
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
    getProduct,
    getFilteredProducts
}