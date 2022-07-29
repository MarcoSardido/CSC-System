import { firebase } from '../../../firebaseConfig.js';
import { getFirestore, doc, collection, getDoc, getDocs, updateDoc, setDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase)

const getAllProducts = async (sid) => {
    const products = [];

    //* LIVE SESSION COLLECTION: sub-collection -> sessionProducts 
    const subColRef = collection(db, `LiveSession/sessionID_${sid}/sessionProducts`)
    const subColData = await getDocs(subColRef);
    subColData.forEach(item => products.push(item.data()))

    return products;
}

const getProduct = async (sid, pid) => {

    //* LIVE SESSION COLLECTION: sub-collection -> sessionProducts 
    const subDocRef = doc(db, `LiveSession/sessionID_${sid}/sessionProducts/${pid}`);
    const subDocData = await getDoc(subDocRef)

    //* LIVE SESSION COLLECTION 
    const docRef = doc(db, `LiveSession/sessionID_${sid}`)
    await updateDoc(docRef, {
        currentProductID: pid
    })

    return subDocData.data();
}

export {
    getAllProducts,
    getProduct,
}