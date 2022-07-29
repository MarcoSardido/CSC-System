import { firebase } from '../../../firebaseConfig.js';
import { getFirestore, doc, collection, getDocs, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase)

const startLiveSelling = async (uid, data) => {
    const productContainer = [];
    const currentDateAndTime = new Date();
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
            sessionID: uniqueID
        })

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
            sessionEnd: data.eventEnd
        })

        const sessionUsers = doc(db, `LiveSession/sessionID_${uniqueID}/sessionUsers/Default`)
        await setDoc(sessionUsers, {
            sample: 'sample',
        })

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

export {
    startLiveSelling,
}