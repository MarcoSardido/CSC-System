import { firebase } from '../../../firebaseConfig.js';
import { getFirestore, doc, collection, getDocs, getDoc, deleteDoc, setDoc  } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";
const db = getFirestore(firebase)

//! ---------------------------------------------------------------------------------
//                           Display Products
//! ---------------------------------------------------------------------------------

const getTotalProducts = async (uuid) => {
    let itemCount = 0;

    try {
        const collectionRef = collection(db, `Sellers/${uuid}/Products`);
        const productCollection = await getDocs(collectionRef)
        productCollection.forEach(productDoc => {
            if (! productDoc) return(0)
            itemCount++
        })
        return(itemCount)

    } catch (err) {
        console.error(`Firestore Error: @Get total products -> ${err.message}`)
    }
}

const displayAllProducts = async (uuid) => {
    const itemContainer = [];

    try {
        const collectionRef = collection(db, `Sellers/${uuid}/Products`);
        const productCollection = await getDocs(collectionRef)
        productCollection.forEach(productDoc => {
            if (! productDoc) return(0)

            itemContainer.push({
                itemID: productDoc.id,
                itemName: productDoc.data().prodName,
                itemPrice: productDoc.data().prodPrice,
                itemDesc: productDoc.data().prodDesc,
                itemType: productDoc.data().prodType,
                itemImages: productDoc.data().productImages,
                itemVariant: productDoc.data().variants
            })
        })
        return itemContainer;

    } catch (err) {
        console.error(`Firestore Error: @Display all products -> ${err.message}`)
    }
}

const getSingleProduct = async (uuid, itemId) => {

    try {
        const docRef = doc(db, `Sellers/${uuid}/Products/${itemId}`)
        const docData = await getDoc(docRef);

        return docData.data();
        
    } catch (err) {
        console.error(`Firestore Error: @Get single product -> ${err.message}`)
    }

}

const deleteSingleProduct = async (uuid, itemId) => {
    const actLogID = `log_${generateId()}`
    
    try {
        //* COLLECTION: Accounts
        const accountDocRef = doc(db, `Accounts/seller_${uuid}`);
        const accountDocument = await getDoc(accountDocRef)

        await setDoc(doc(db, `Accounts/seller_${uuid}/Activity Logs`, actLogID), {
            name: accountDocument.data().displayName,
            type: ['Product', 'Removed', itemId],
            dateAdded: new Date()
        })

        //* COLLECTION: Sellers -> SUB-COLLECTION: Products
        const docRef = doc(db, `Sellers/${uuid}/Products/${itemId}`)
        await deleteDoc(docRef)
        
    } catch (err) {
        console.error(`Firestore Error: @Delete single product -> ${err.message}`)
    }

}

const generateId = () => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

export {
    getTotalProducts,
    displayAllProducts,
    getSingleProduct,
    deleteSingleProduct
}