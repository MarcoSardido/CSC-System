import { firebase } from '../../../firebase.js';
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';

const db = getFirestore(firebase);

export const settings = async (req, res) => {
    const { uid } = req.body;

    const sellerData = {}, accountData = {}, actLogsData = [];
    const currentTab = req.query.tab === 'account' ? 'account' :
        req.query.tab === 'logs' ? 'logs' :
            req.query.tab === 'faq' ? 'faq' : 'about';

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


        //* ============================== Accounts Data ===================================== *//

        //* COLLECTION: Accounts
        const accountRef = doc(db, `Accounts/seller_${uid}`);
        const accountDoc = await getDoc(accountRef);

        //* COLLECTION: Seller
        const sellerRef = doc(db, `Sellers/${uid}`);
        const sellerDoc = await getDoc(sellerRef);

        Object.assign(accountData, {
            accountPhoto: accountDoc.data().userPhoto,
            photoType: accountDoc.data().imgType,
            accountName: accountDoc.data().displayName,
            accountFname: sellerDoc.data().fullName,
            accountEmail: accountDoc.data().email,
            accountNumber: sellerDoc.data().contactNo,
            accountBirthday: sellerDoc.data().birthday,
            accountGender: sellerDoc.data().gender,
        })


        //* ============================== Activity Logs Data ===================================== *//

        //* COLLECTION: Sellers
        const sellerDocRef = doc(db, `Sellers/${uid}`);
        const sellerDocument = await getDoc(sellerDocRef)

        const detectGender = sellerDocument.data().gender === 'Male' ? 'his' : 'her';

        //* COLLECTION: Accounts -> SUB-COLLECTION: Activity Logs
        const activityLogsSubColRef = collection(db, `Accounts/seller_${uid}/Activity Logs`);
        const activityLogsQuery = query(activityLogsSubColRef, orderBy('dateAdded'))
        const activityLogsSubCollection = await getDocs(activityLogsQuery);
        activityLogsSubCollection.forEach(doc => {
            const data = doc.data();
            const convertedTimestamp = new Date(data.dateAdded.seconds * 1000 + data.dateAdded.nanoseconds / 1000);

            if (Array.isArray(data.type)) { //? Product, Profile
                let logDesc;
                
                if (data.type[0] === 'Product') {
                    logDesc = data.type[1] === 'Added' ? `has added a new product <strong>${data.type[2]}</strong>.` :
                    data.type[1] === 'Modified' ? `has updated a product <strong>${data.type[2]}</strong>.` : `has deleted a product <strong>${data.type[2]}</strong>.`;
                } else if (data.type[0] === 'Profile') {
                    logDesc = data.type[1] === 'Information' ? `updated ${detectGender} profile information.` : `updated ${detectGender} profile picture`;
                }

                actLogsData.push({
                    name: data.name,
                    description: logDesc,
                    photo: `data:${accountColDoc.data().type};base64,${accountColDoc.data().userPhoto}`,
                    date: convertedTimestamp.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/ /g, ' '),
                    time: convertedTimestamp.toLocaleTimeString()
                })

            } else { //? Login
                
                actLogsData.push({
                    name: data.name,
                    description: 'has logged in.',
                    photo: `data:${accountColDoc.data().type};base64,${accountColDoc.data().userPhoto}`,
                    date: convertedTimestamp.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/ /g, ' '),
                    time: convertedTimestamp.toLocaleTimeString()
                })
            }
        })

        const groupBy = (items, key) => items.reduce((result, item) => ({
            ...result,
            [item[key]]: [
                ...(result[item[key]] || []),
                item,
            ],
        }), {},
        );

        const arrayReverseObj = (obj) => {
            let reversedArray = []

            Object.keys(obj)
                .sort()
                .reverse()
                .forEach(key => {
                    reversedArray.push({
                        'date': key,
                        'logs': obj[key]
                    })
                })
            return reversedArray
        }


        const groupFormat = groupBy(actLogsData, 'date');
        const finalizedLogs = arrayReverseObj(groupFormat);

        res.render('seller/settings', {
            title: 'settings',
            url: "urlPath",
            layout: 'layouts/sellerLayout',
            settingsTab: currentTab,
            settingsData: [accountData, finalizedLogs],
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