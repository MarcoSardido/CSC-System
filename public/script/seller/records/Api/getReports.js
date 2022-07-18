import { firebase } from '../../../firebaseConfig.js';
import { getFirestore, doc, collection, getDocs, getDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";
const db = getFirestore(firebase)

const getAllReportId = async (uuid) => {
    const finalContainer = [];
    const getAllReportIDs = [];
    const getAllComplainantIDs = [];

    try {
        // Get report in seller account
        const collectionRef = collection(db, `Accounts/seller_${uuid}/Reports`)
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

        // Get report data
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

        // Get account data
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

    } catch (err) {
        console.error(`Firestore Error: @Get all reports id -> ${err.message}`)
    }
}

export {
    getAllReportId,
}