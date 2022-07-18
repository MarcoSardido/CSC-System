import { firebase } from '../../../firebaseConfig.js';
import { getFirestore, doc, collection, getDocs, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase)

const getLiveRooms = async () => {
    const openLiveSession = [];

    try {
        // Get all seller ids with live sessions
        const sellerSessionsRef = collection(db, `LiveSession`)
        const sellerSessionCol = await getDocs(sellerSessionsRef);
        sellerSessionCol.forEach(session => {

            if (session.data().sessionOpen) {
                openLiveSession.push({
                    sellerID: session.data().sellerID,
                    sessionID: session.id,
                    bannerImg: '',
                    logoImg: '',
                    eventDesc: '',
                    eventName: '',
                    roomName: '',
                })
            }
        })

        for (const [roomIndex, roomValue] of openLiveSession.entries()) {
            const sellerID = roomValue.sellerID;
            const sessionID = roomValue.sessionID;

            const sessionRoomRef = doc(db, `Sellers/${sellerID}/LiveSessions/${sessionID}`)
            const sessionRoomDoc = await getDoc(sessionRoomRef)

            openLiveSession[roomIndex].bannerImg = sessionRoomDoc.data().bannerImg
            openLiveSession[roomIndex].eventDesc = sessionRoomDoc.data().eventDescription
            openLiveSession[roomIndex].eventName = sessionRoomDoc.data().eventName
            openLiveSession[roomIndex].logoImg = sessionRoomDoc.data().logoImg
            openLiveSession[roomIndex].roomName = sessionRoomDoc.data().roomName
        }


        return openLiveSession;
    } catch (error) {
        console.error(`Firestore: @getLiveRooms -> ${error.message}`)
    }
}

export {
    getLiveRooms,
}