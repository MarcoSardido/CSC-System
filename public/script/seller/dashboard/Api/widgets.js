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
    const customerRateArray = [];

    try {
        //* SELLER COLLECTION -> SUB-COLLECTION: Rating
        const ratingColRef = collection(db, `Sellers/${uid}/Rating`);
        const ratingCollection = await getDocs(ratingColRef);
        ratingCollection.forEach(rate => customerRateArray.push(rate.data().rate));

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
    const finalContainer = [];
    const getAllReportIDs = [];
    const getAllComplainantIDs = [];

    try {
        //* ACCOUNTS COLLECTION -> SUB-COLLECTION: Reports
        const collectionRef = collection(db, `Accounts/seller_${uid}/Reports`)
        const sellerReportCollection = await getDocs(collectionRef)

        sellerReportCollection.forEach(item => {
            getAllReportIDs.push(item.id);

            finalContainer.push({
                ticketID: item.id,
                complainantID: '',
                complainantPhoto: '',
                complainantName: '',
                complainantDescription: '',
                reportType: '',
                daysBanned: item.data().daysBanned,
                punishment: item.data().punishment,
                punishmentMessage: item.data().message,
                date: '',
                status: '',
            })
        })

        //* REPORTS COLLECTION
        const reportCollectionRef = collection(db, `Reports`)
        const reportCollection = await getDocs(reportCollectionRef)

        reportCollection.forEach((reportDoc) => {
            if (getAllReportIDs.includes(reportDoc.id)) {
                getAllComplainantIDs.push(reportDoc.data().complainantID)

                for (const finalContIndex of finalContainer) {
                    if (reportDoc.id === finalContIndex.ticketID) {
                        finalContIndex.complainantID = reportDoc.data().complainantID;
                        finalContIndex.complainantName = reportDoc.data().complainant;
                        finalContIndex.complainantDescription = reportDoc.data().description;
                        finalContIndex.reportType = reportDoc.data().type;
                        finalContIndex.status = reportDoc.data().status;
                        finalContIndex.date = reportDoc.data().reportPlaced;
                    }
                }
            }
        })

        //* ACCOUNTS COLLECTION
        const accountCollectionRef = collection(db, 'Accounts')
        const accountCollection = await getDocs(accountCollectionRef)

        accountCollection.forEach(accountDoc => {
            if (getAllComplainantIDs.includes(accountDoc.id)) {

                for (const finalContIndex of finalContainer) {
                    if (accountDoc.id === finalContIndex.complainantID) {
                        finalContIndex.complainantPhoto = `data:${accountDoc.data().imgType};base64,${accountDoc.data().userPhoto}`
                    }
                }

            }

        })

        return finalContainer;

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