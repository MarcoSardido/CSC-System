import { firebase } from '../../../firebase.js';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const db = getFirestore(firebase);

export const report = async (req, res) => {
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

        res.render('seller/manageReport', {
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
        console.error(`Firestore Error -> @reportPage: ${error.message}`);
    }
}