import { firebase } from '../../../firebase.js';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';

const db = getFirestore(firebase);

const product = async (req, res) => {
    const uid = req.body.uid;
    const sellerData = {};

    try {
        //* ACCOUNTS COLLECTION
        const accountColRef = doc(db, `Accounts/seller_${uid}`);
        const accountColDoc = await getDoc(accountColRef);

        //* SELLER COLLECTION
        const sellerColRef = doc(db, `Sellers/${uid}`);
        const sellerColDoc = await getDoc(sellerColRef);

        //* STRIPE COLLECTION -> SUB-COLLECTION: Services
        const stripeColRef = doc(db, `Stripe Accounts/seller_${uid}/Services/Subscription`)
        const stripeColDoc = await getDoc(stripeColRef);

        sellerData.accountCol = accountColDoc.data();
        sellerData.sellerCol = sellerColDoc.data();
        sellerData.stripeCol = stripeColDoc.data();

        res.render('seller/products/displayProducts', {
            title: 'products',
            url: "urlPath",
            uid: res.locals.uid,
            layout: 'layouts/sellerLayout',
            verification: '',
            user: '',
            hasSubscription: true,
            subSuccess: '',
            subUpdateSuccess: '',
            sellerInfo: sellerData,
            isSelling: false,
        })

    } catch (error) {
        console.error(`Firestore Error -> @productPage: ${error.message}`);
    }
}

const getProduct = async (req, res) => {
    const { id } = req.params;
    const { uid } = req.body;

    const sellerData = {};
    try {
        //* ACCOUNTS COLLECTION
        const accountColRef = doc(db, `Accounts/seller_${uid}`);
        const accountColDoc = await getDoc(accountColRef);

        //* SELLER COLLECTION
        const sellerColRef = doc(db, `Sellers/${uid}`);
        const sellerColDoc = await getDoc(sellerColRef);

        //* STRIPE COLLECTION -> SUB-COLLECTION: Services
        const stripeColRef = doc(db, `Stripe Accounts/seller_${uid}/Services/Subscription`)
        const stripeColDoc = await getDoc(stripeColRef);

        sellerData.accountCol = accountColDoc.data();
        sellerData.sellerCol = sellerColDoc.data();
        sellerData.stripeCol = stripeColDoc.data();

        //* COLLECTION: Sellers -> SUB-COLLECTION: Products
        const productDocRef = doc(db, `Sellers/${uid}/Products/${id}`);
        const productDocument = await getDoc(productDocRef);

        res.render('seller/products/getProduct', {
            title: 'products',
            uid: res.locals.uid,
            layout: 'layouts/sellerLayout',
            verification: '',
            subSuccess: '',
            hasSubscription: true,
            sellerInfo: sellerData,
            isSelling: false,
            productData: productDocument.data()
        })

    } catch (error) {
        console.error(`Firestore -> @getProduct: ${error.message}`);
    }
}

const getReviews = async (req, res) => {
    const { id } = req.params;
    const { uid } = req.body;

    try {
        const productReviewsArray = [], customerIDArray = [];

        //* COLLECTION: Sellers -> SUB-COLLECTION: Products -> Sub-COLLECTION: Reviews
        const prodReviewSubColRef = collection(db, `Sellers/${uid}/Products/${id}/Reviews`);
        const prodReviewSubCollection = await getDocs(prodReviewSubColRef);
        prodReviewSubCollection.forEach(doc => {
            customerIDArray.push(doc.data().customerID);
            productReviewsArray.push({
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

            for (const [productReviewIndex, productReviewValue] of productReviewsArray.entries()) {
                if (productReviewValue.customer.uid === customerIDIndex) {
                    productReviewsArray[productReviewIndex].customer.displayName = accountDocument.data().displayName;
                    productReviewsArray[productReviewIndex].customer.picture = `data:${accountDocument.data().imgType};base64,${accountDocument.data().userPhoto}`;
                }
            }
        }

        res.status(200).json(productReviewsArray);
    } catch (error) {
        console.error(`Firestore Error: @getReviews -> ${error.message}`);
        res.status(500);
    }
}

export {
    product,
    getProduct,
    getReviews
}