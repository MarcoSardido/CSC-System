import { firebase } from '../../../firebase.js';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const db = getFirestore(firebase);

export const settings = async (req, res) => {
    const uid = req.body.uid;
    const sellerData = {};
    const currentTab = req.query.tab === 'account' ? 'account' :
        req.query.tab === 'faq' ? 'faq' :
            'about';

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

        // Get user data
        if (currentTab === 'account') {
            const userData = {};

            // Accounts Collection
            const accountRef = doc(db, `Accounts/seller_${uid}`);
            const accountDoc = await getDoc(accountRef);

            // Seller Collection
            const sellerRef = doc(db, `Sellers/${uid}`);
            const sellerDoc = await getDoc(sellerRef);

            Object.assign(userData, {
                accountPhoto: accountDoc.data().userPhoto,
                photoType: accountDoc.data().imgType,
                accountName: accountDoc.data().displayName,
                accountFname: sellerDoc.data().fullName,
                accountEmail: accountDoc.data().email,
                accountNumber: sellerDoc.data().contactNo,
                accountBirthday: sellerDoc.data().birthday,
                accountGender: sellerDoc.data().gender,
            })

            res.render('seller/settings', {
                title: 'settings',
                url: "urlPath",
                layout: 'layouts/sellerLayout',
                settingsTab: currentTab,
                settingsData: userData,
                verification: '',
                user: '',
                hasSubscription: true,
                subSuccess: '',
                subUpdateSuccess: '',
                sellerInfo: sellerData,
                isSelling: false,
            })
        } else {

            res.render('seller/settings', {
                title: 'settings',
                url: "urlPath",
                layout: 'layouts/sellerLayout',
                settingsTab: currentTab,
                settingsData: '',
                verification: '',
                user: '',
                hasSubscription: true,
                subSuccess: '',
                subUpdateSuccess: '',
                sellerInfo: sellerData,
                isSelling: false,
            })
        }

    } catch (error) {
        console.error(`Firestore Error -> @reportPage: ${error.message}`);
    }
}