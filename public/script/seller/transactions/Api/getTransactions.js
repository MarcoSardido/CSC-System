import { firebase } from '../../../firebaseConfig.js';
import { getFirestore, doc, collection, getDocs, getDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";
const db = getFirestore(firebase)

const getAllTransactionRecords = async (uuid) => {
    const transactionContainer = [];

    try {
        const collectionRef = collection(db, `Sellers/${uuid}/Transactions`);
        const filter = query(collectionRef, orderBy('date'));
        const transactionCollection = await getDocs(filter);

        transactionCollection.forEach(record => {
            transactionContainer.push({
                customer: record.data().customer,
                date: record.data().date,
                id: record.data().id,
                items: record.data().items,
                orderID: record.data().orderID,
                payment: record.data().payment,
                status: record.data().status,
                totalPrice: formatThousands(record.data().totalPrice / 100)
            })
        });

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

        transactionCollection.forEach(record => {
            analyticsContainer.push({
                date: record.data().date,
                totalPrice: formatThousands(record.data().totalPrice / 100)
            })
        });

        return analyticsContainer;
    } catch (err) {
        console.error(`Firestore Error: @Get data for analytics -> ${err.message}`)
    }
}


const dataForRecentTransactions = async (uuid) => {
    const recentTransContainer = [];
    const stripeSubs = {};

    try {
        // Get recent transactions
        const collectionRef = collection(db, `Sellers/${uuid}/Transactions`);
        const filter = query(collectionRef, orderBy('date'), limit(8));
        const transactionCollection = await getDocs(filter);

        transactionCollection.forEach(record => recentTransContainer.push({
            date: record.data().date,
            totalPrice: formatThousands(record.data().totalPrice / 100),
            customerName: record.data().customer.displayName,
        }));
        recentTransContainer.reverse();

        // Get recent subscription
        const subscriptionRef = doc(db, `Stripe Accounts/seller_${uuid}/Services/Subscription`);
        const subsDocument = await getDoc(subscriptionRef);

        const subType = subsDocument.data().sellerType === 'Individual Seller' ? 'Individual Seller' : 'Corporate Seller';
        const priceType = subsDocument.data().sellerType === 'Individual Seller' ? 100 : 500;

        const subsDate = subsDocument.data().currentSubscriptionBill.split(' ');
        const formatSubDate = `${subsDate[2]} ${subsDate[1]} ${subsDate[3]}`;

        Object.assign(stripeSubs, {
            subscriptionType: subType,
            subscriptionPrice: priceType,
            subscriptionDate: formatSubDate
        })

        return { recentTransContainer, stripeSubs };

    } catch (err) {
        console.error(`Firestore Error: @Get data for recent transaction -> ${err.message}`)
    }
}

const formatThousands = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


export {
    getAllTransactionRecords,
    dataForAnalytics,
    dataForRecentTransactions
}