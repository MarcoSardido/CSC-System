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
            customer: '',
            sellerID: uid,
            sessionStatus: 'Open',
            sessionStart: data.eventStart,
            sessionDuration: data.eventDuration === '30' ? `${data.eventDuration} Minutes` : `${data.eventDuration} Hours`,
            sessionEnd: data.eventEnd,
            timeLeft: 0
        })

        // Room ID
        return uniqueID;
    } catch (error) {
        console.error(`Firestore Error: @startLiveSelling -> ${error.message}`)
    }

}

const checkLiveSessions = async () => {
    const numActiveRooms = [], numWaitingRooms = [];

    try {
        //* LIVE SESSION COLLECTION
        const liveSessionColRef = collection(db, `LiveSession`);
        const liveSessionCollection = await getDocs(liveSessionColRef);

        liveSessionCollection.forEach(session => {
            if (session.data().sessionStatus === 'Open') {
                numActiveRooms.push(session.data().sessionEnd)
            } else if (session.data().sessionStatus === 'Waiting') {
                numWaitingRooms.push(session.data().sessionStart)
            }
        })
        
        return { activeRooms: numActiveRooms, waitingRooms: numWaitingRooms}


    } catch (error) {
        console.error(`Firestore Error: @checkLiveSessions -> ${error.message}`)
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
    let finalDate;
    const date = new Date();

    let formattedDate = date.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    }).replace(/ /g, ' ');

    const checkMonth = formattedDate.split(' ')[1];
    const spread = [...checkMonth];

    if (spread.length > 3) {
        let trimmedMonth, convertDateToArray;
        convertDateToArray = formattedDate.split(' ');
        spread.pop();
        trimmedMonth = spread.join('');
        convertDateToArray.splice(1, 1, trimmedMonth);
        finalDate = convertDateToArray.join(' ');
    }

    return finalDate === undefined ? formattedDate : finalDate;
}

export {
    startLiveSelling,
    checkLiveSessions,
}