import { firebase } from '../../../firebaseConfig.js';
import { getFirestore, doc, collection, getDocs, getDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";
const db = getFirestore(firebase)

const getAllReportId = async (uid) => {
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
    } catch (err) {
        console.error(`Firestore Error: @Get all reports id -> ${err.message}`)
    }
}

export {
    getAllReportId,
}