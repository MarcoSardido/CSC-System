import { firebase } from '../../../firebaseConfig.js';
import { getFirestore, doc, collection, getDocs, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase)

const startLiveSelling = async (uid, data) => {
    const productContainer = [];
    const currentDateAndTime = new Date();
    const formattedDate = stringDateFormat();
    const uniqueID = generateId();

    try {

        //* SELLER COLLECTION: Sub-collection: LiveSessions
        const sellerSubRef = doc(db, `Sellers/${uid}/LiveSessions/sessionID_${uniqueID}`)
        await setDoc(sellerSubRef, {
            eventDescription: data.eventDesc,
            eventName: data.eventName,
            bannerImg: data.eventBanner,
            logoImg: data.eventLogo,
            roomName: data.storeName,
            sessionID: uniqueID,
            createdAt: formattedDate,
        })

        //? Adding all seller products to live session 
        const sellerProdRef = collection(db, `Sellers/${uid}/Products`)
        const sellerProdData = await getDocs(sellerProdRef)
        sellerProdData.forEach(product => productContainer.push(product.data()))
        for (const productIndex of productContainer) {
            const liveSessionProductRef = doc(db, `LiveSession/sessionID_${uniqueID}/sessionProducts/${productIndex.prodID}`)
            await setDoc(liveSessionProductRef, productIndex)
        }

        //* LIVE SESSION COLLECTION
        const liveSessionRef = doc(db, `LiveSession/sessionID_${uniqueID}`)
        await setDoc(liveSessionRef, {
            createdAt: currentDateAndTime,
            sellerID: uid,
            sessionOpen: true,
            sessionStart: data.eventStart,
            sessionDuration: data.eventDuration === '30' ? `${data.eventDuration} Minutes` : `${data.eventDuration} Hours`,
            sessionEnd: data.eventEnd
        })

        // Room ID
        return uniqueID;
    } catch (error) {
        console.error(`Firestore Error: @startLiveSelling -> ${error.message}`)
    }

}


const generateId = () => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 15; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

// Result: 01 Jul 2022
const stringDateFormat = () => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    }).replace(/ /g, ' ');
    return formattedDate;
}

export {
    startLiveSelling,
}