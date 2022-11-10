import { firebase } from '../../../firebaseConfig.js';
import { getFirestore, doc, collection, getDocs, getDoc, setDoc, query, orderBy, limit, where } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase);

const getItemsToBeSold = async (uid) => {
    const productsArray = [];

    try {

        //* SELLER COLLECTION -> SUB-COLLECTION: Products
        const productsColRef = collection(db, `Sellers/${uid}/Products`);
        const productCollection = await getDocs(productsColRef);
        productCollection.forEach(product => productsArray.push(product.data()));

        return productsArray;

    } catch (error) {
        console.error(`Firestore Error: @getItemsToBeSold -> ${error.message}`)
    }
}

const getCustomerRate = async (uid) => {
    const tempSellerIDArray = [];
    const customerRateArray = [];

    try {
        //* SELLER COLLECTION -> SUB-COLLECTION: Products
        const productsColRef = collection(db, `Sellers/${uid}/Products`);
        const productsCollection = await getDocs(productsColRef);
        productsCollection.forEach(doc => {
            tempSellerIDArray.push(doc.id)
        })

        for (const sellerIndex of tempSellerIDArray) {
            //* SELLER COLLECTION -> SUB-COLLECTION: Products -> SUB-COLLECTION: Reviews
            const reviewsColRef = collection(db, `Sellers/${uid}/Products/${sellerIndex}/Reviews`);
            const reviewsCollection = await getDocs(reviewsColRef);

            reviewsCollection.forEach(reviewDoc => {
                customerRateArray.push(reviewDoc.data().rate)
            })
        }

        return customerRateArray;

    } catch (error) {
        console.error(`Firestore Error: @getCustomerRate -> ${error.message}`)
    }
}


const getTransactions = async (uid) => {
    const customerArray = [], itemSoldArray = [], weeklyRevenueArray = [];
    let totalRevenue = 0;

    try {

        //* SELLER COLLECTION -> SUB-COLLECTION: Transactions
        const transactionsColRef = collection(db, `Sellers/${uid}/Transactions`);
        const transactionsCollection = await getDocs(transactionsColRef);

        //? Get total served customers
        transactionsCollection.forEach(customer => {
            if (customerArray.length < 1) {
                customerArray.push(customer.data().customer.uid);

            } else {
                if (!customerArray.includes(customer.data().customer.uid)) {
                    customerArray.push(customer.data().customer.uid);
                }
            }
        })

        //? Get total items sold & total revenue & weekly revenue
        transactionsCollection.forEach(itemSold => {
            if (itemSold.data().status === 'Success') {

                itemSoldArray.push(itemSold.data().transactionID);
                weeklyRevenueArray.push({
                    date: itemSold.data().date,
                    price: formatThousands(itemSold.data().totalPrice / 100)
                });
                totalRevenue += itemSold.data().totalPrice;
            }
        })

        return { totalCustomers: customerArray, itemsSold: itemSoldArray, weeklyRevenue: weeklyRevenueArray, totalRevenue: formatThousands(totalRevenue / 100) };

    } catch (error) {
        console.error(`Firestore Error: @getTransactions -> ${error.message}`)
    }
}

const getReport = async (uid) => {
    const reportArray = [], reportedCustomerIDs = [];

    try {
        //* COLLECTION: Sellers -> SUB-COLLECTION: Reports
        const reportsSubColRef = collection(db, `Sellers/${uid}/Reports`);
        const reportsSubCollection = await getDocs(reportsSubColRef);
        reportsSubCollection.forEach(doc => {
            reportedCustomerIDs.push(doc.data().reportedCustomerID);
            reportArray.push(doc.data());
        })


        for (const reportedIndex of reportedCustomerIDs) {
            //* COLLECTION: Accounts
            const accountDocRef = doc(db, `Accounts/customer_${reportedIndex}`);
            const accountDocument = await getDoc(accountDocRef);

            for (const [reportDataIndex, reportDataValue] of reportArray.entries()) {
                if (reportDataValue.reportedCustomerID === reportedIndex) {
                    reportArray[reportDataIndex].reportedCustomerPhoto = `data:${accountDocument.data().imgType};base64,${accountDocument.data().userPhoto}`;
                }
            }
        }

        return reportArray;
    } catch (error) {
        console.error(`Firestore Error: @getReport -> ${error.message}`);
    }
}

const getLiveSummary = async (uid) => {
    const liveArray = [];

    try {

        //* SELLERS COLLECTION -> SUB-COLLECTION: LiveSessions
        const sellerLiveSessionSubColRef = collection(db, `Sellers/${uid}/LiveSessions`);
        const sellerLiveSessionSubCollection = await getDocs(sellerLiveSessionSubColRef);

        sellerLiveSessionSubCollection.forEach(session => {
            liveArray.push({
                date: session.data().createdAt,
                totalViewers: session.data().totalViewCount
            })
        })

        return liveArray;

    } catch (error) {
        console.error(`Firestore Error: @getLiveSummary -> ${error.message}`);
    }
}

const formatThousands = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export {
    getItemsToBeSold,
    getCustomerRate,
    getTransactions,
    getReport,
    getLiveSummary
}