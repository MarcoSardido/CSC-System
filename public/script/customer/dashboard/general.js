import { firebase } from '../../firebaseConfig.js';
import { getFirestore, doc, collection, getDoc, getDocs, setDoc, deleteDoc, updateDoc, onSnapshot, query, orderBy, limit, where } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase)



$(document).ready(() => {

    //! ===========================================================================================
    // ================================ Start of Firebase Function ================================
    //! ===========================================================================================

    //? Realtime product display
    const liveColRef = collection(db, `LiveSession`);
    const liveQuery = query(liveColRef, where('sessionStatus', '==', 'Open'));

    // onSnapshot(liveQuery, queryResult => {
    //     queryResult.forEach(room => {
    //         console.log(room.id)
    //     })
    // })

    //? Get all open rooms
    const getLiveRooms = async () => {
        const openLiveSession = [];

        try {
            // Get all seller ids with live sessions
            const sellerSessionsRef = collection(db, `LiveSession`)
            const sellerSessionCol = await getDocs(sellerSessionsRef);
            sellerSessionCol.forEach(session => {

                if (session.data().sessionStatus === 'Open') {
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

    //! ===========================================================================================
    // ============================== End of Firebase Function ====================================
    //! ===========================================================================================

    //* Generate HTML Elements
    const generateRoom = (data) => {
        const displayContainer = document.querySelector('.live-container');
        const size = data.length;

        if (size === 1) {
            let roomContent = `
                <div class="live" data-room-id="${data[0].sessionID}" style="background-image: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.90) 100%), url('${data[0].bannerImg}');">
                    <img src="${data[0].logoImg}" alt="${data[0].roomName}">
        
                    <div class="middle">
                        <div class="left" style="color: #fff;">
                            <br><br>
                            <span class="live-tag">LIVE NOW</span><h1>${data[0].roomName} (${data[0].eventName})</h1>
                        </div>
                    </div>
                    <small class="room-text-muted" style="color: #fff">${data[0].eventDesc}.</small>
                </div>
            `;

            displayContainer.insertAdjacentHTML('beforeend', roomContent);
        } else {
            let roomContent = ``;

            roomContent += `
                <div class="live" data-room-id="${data[0].sessionID}" style="background-image: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.90) 100%), url('${data[0].bannerImg}');">
                    <img src="${data[0].logoImg}" alt="${data[0].roomName}">

                    <div class="middle">
                        <div class="left" style="color: #fff;">
                            <br><br>
                            <span class="live-tag">LIVE NOW</span><h1>${data[0].roomName} (${data[0].eventName})</h1>
                        </div>
                    </div>
                    <small class="room-text-muted" style="color: #fff">${data[0].eventDesc}.</small>
                </div>
            `;

            for (let roomIndex = 1; roomIndex < data.length; roomIndex++) {
                roomContent += `
                    <div class="live" data-room-id="${data[roomIndex].sessionID}" style="background-image: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.90) 100%), url('${data[roomIndex].bannerImg}');">
                        <img src="${data[roomIndex].logoImg}" alt="${data[roomIndex].roomName}">

                        <div class="middle">
                            <div class="left" style="color: #fff;">
                                <br><br>
                                <span class="live-tag">LIVE NOW</span><h1>${data[roomIndex].roomName} (${data[roomIndex].eventName})</h1>
                            </div>
                        </div>
                        <small class="room-text-muted" style="color: #fff">${data[roomIndex].eventDesc}.</small>
                    </div>
                `;
            }
            console.log('else')
            console.log(roomContent)
            displayContainer.insertAdjacentHTML('beforeend', roomContent);

        }
    }

    // Display available rooms
    const displayRooms = (data) => {
        const size = data.length;
        if (size > 0) {
            $('.no-live-text').remove();
            generateRoom(data)
        }
    };


    getLiveRooms().then(result => {
        displayRooms(result);
    })
})