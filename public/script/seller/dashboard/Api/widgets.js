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
    let totalRevenue = 0, todaysSale = 0;
    const currentDate = stringDateFormat()

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


        transactionsCollection.forEach(itemSold => {
            //? Get todays sale
            if (itemSold.data().date === currentDate) {
                todaysSale += itemSold.data().totalPrice
            }

            //? Get total items sold & total revenue & weekly revenue
            if (itemSold.data().status === 'Success') {
                itemSoldArray.push(itemSold.data().transactionID);
                weeklyRevenueArray.push({
                    date: itemSold.data().date,
                    price: itemSold.data().totalPrice
                });
                totalRevenue += itemSold.data().totalPrice;
            }
        })

        return { todaySale: todaysSale, totalCustomers: customerArray, itemsSold: itemSoldArray, weeklyRevenue: weeklyRevenueArray, totalRevenue: formatPeso(totalRevenue) };

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

const formatPeso = (price) => {
    return price.toLocaleString('en-ph', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}

const stringDateFormat = () => {
    let currentDate;
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    }).replace(/ /g, ' ');
    currentDate = formattedDate.split(' ')
    if (currentDate[0] < 10) {
        currentDate[0] = `0${currentDate[0]}`;
    }
    return currentDate.join(' ');
}


export {
    getItemsToBeSold,
    getCustomerRate,
    getTransactions,
    getReport,
    getLiveSummary
}