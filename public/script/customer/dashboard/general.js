import { firebase } from '../../firebaseConfig.js';
import { getFirestore, doc, collection, getDoc, getDocs, setDoc, deleteDoc, updateDoc, onSnapshot, query, orderBy, limit, where } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase)



$(document).ready(() => {

    //! ===========================================================================================
    // ================================ Start of Firebase Function ================================
    //! ===========================================================================================

    //? Realtime product display
    const liveColRef = collection(db, `LiveSession`);

    onSnapshot(liveColRef, async (queryResult) => {
        const openLiveSession = [];

        queryResult.forEach(room => {
            if (room.data().sessionStatus === 'Open' || room.data().sessionStatus === 'Market') {
                openLiveSession.push({
                    sellerID: room.data().sellerID,
                    sessionID: room.id,
                    sessionStatus: room.data().sessionStatus
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

        displayRooms(openLiveSession);
    })

    //! ===========================================================================================
    // ============================== End of Firebase Function ====================================
    //! ===========================================================================================

    //* Generate HTML Elements
    const generateRoom = (roomData) => {
        const displayContainer = document.querySelector('.live-container');
        const size = roomData.length;

        if (size === 1) {
            let roomContent = `
                <div class="live room" data-room-id="${roomData[0].sessionID}" style="background-image: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.90) 100%), url('${roomData[0].bannerImg}');">
                    <img src="${roomData[0].logoImg}" alt="${roomData[0].roomName}">
        
                    <div class="middle">
                        <div class="left" style="color: #fff;">
                            <br><br>
                            
                            <span class="live-tag">${roomData[0].sessionStatus === 'Open' ? 'LIVE NOW' : 'MARKET'}</span><h1>${roomData[0].roomName} (${roomData[0].eventName})</h1>
                        </div>
                    </div>
                    <small class="room-text-muted" style="color: #fff">${roomData[0].eventDesc}.</small>
                </div>
            `;

            displayContainer.insertAdjacentHTML('beforeend', roomContent);
        } else {
            let roomContent = ``;

            const loopRooms = () => {
                let roomsContent = ``;
                for (let roomIndex = 1; roomIndex < roomData.length; roomIndex++) {
                    roomsContent += `
                        <div class="live room" data-room-id="${roomData[roomIndex].sessionID}" style="background-image: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.90) 100%), url('${roomData[roomIndex].bannerImg}');">
                            <img src="${roomData[roomIndex].logoImg}" alt="${roomData[roomIndex].roomName}">

                            <div class="middle">
                                <div class="left" style="color: #fff;">
                                    <br><br>
                                    <span class="live-tag">${roomData[roomIndex].sessionStatus === 'Open' ? 'LIVE NOW' : 'MARKET'}</span><h1>${roomData[roomIndex].roomName} (${roomData[roomIndex].eventName})</h1>
                                </div>
                            </div>
                            <small class="room-text-muted" style="color: #fff">${roomData[roomIndex].eventDesc}.</small>
                        </div>
                    `;
                    return roomsContent;
                }
            }

            roomContent += `
                <div class="live room" data-room-id="${roomData[0].sessionID}" style="background-image: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.90) 100%), url('${roomData[0].bannerImg}');">
                    <img src="${roomData[0].logoImg}" alt="${roomData[0].roomName}">

                    <div class="middle">
                        <div class="left" style="color: #fff;">
                            <br><br>
                            <span class="live-tag">${roomData[0].sessionStatus === 'Open' ? 'LIVE NOW' : 'MARKET'}</span><h1>${roomData[0].roomName} (${roomData[0].eventName})</h1>
                        </div>
                    </div>
                    <small class="room-text-muted" style="color: #fff">${roomData[0].eventDesc}.</small>
                </div>
                <div class="lives">
                    ${loopRooms()}
                </div>
            `;
            displayContainer.insertAdjacentHTML('beforeend', roomContent);
        }
    }

    const initializeModal = (roomData) => {
        const allRooms = document.querySelectorAll('.room');

        for (const roomIndex of allRooms) {
            roomIndex.addEventListener('click', () => {
                showModal(roomData, roomIndex.dataset.roomId)
            })
        }
    }

    const showModal = (data, id) => {
        const modalContent = document.querySelector('.modal-content');
        let content = ``;

        for (const roomDataIndex of data) {
            if (roomDataIndex.sessionID !== id) continue;

            content += `
                <div class="modal-header">
                    <h2 class="modal-title" id="joinModalLabel">You're joining ${roomDataIndex.roomName}</h2>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info anonymous-info" role="alert">
                        <ion-icon name="information-circle-outline"></ion-icon>
                        <p>Being an <strong>Anonymous Buyer</strong> hides your information to the seller when you buy. But you can't use live chat.</p>
                    </div>
                    <div class="form-input">
                        <input type="checkbox" id="chkAnonymous" value='true' />
                        <p>Be Anonymous Buyer</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="btnJoinLive" data-live-id="${id}">Join</button>
                </div>
            `;
        }
        if (modalContent.hasChildNodes) $('.modal-content').empty();

        modalContent.insertAdjacentHTML('beforeend', content);
        $('#joinRoomModal').modal('show');
        joinRoom(data, id);
    }

    const joinRoom = (roomData, id) => {
        const isAnonymous = document.getElementById('chkAnonymous');
        const btnJoinLive = document.getElementById('btnJoinLive');

        btnJoinLive.addEventListener('click', () => {
            const sessionID = btnJoinLive.dataset.liveId;
            const trimmedSessionID = sessionID.split('_')[1];

            for (const roomDataIndex of roomData) {
                if (roomDataIndex.sessionID !== id) continue;

                if (roomDataIndex.sessionStatus === 'Open') {
                    window.location.assign(`${window.location.href}/live/room/${trimmedSessionID}?isAnonymous=${isAnonymous.checked}`);
                } else if (roomDataIndex.sessionStatus === 'Market') {
                    window.location.assign(`${window.location.href}/marketplace/room/${trimmedSessionID}?isAnonymous=${isAnonymous.checked}`);
                }
            }




        })
    }

    // Display available rooms
    const displayRooms = (data) => {
        const size = data.length;
        if (size > 0) {
            $('.no-live-text').remove();
            $('.live-container').empty();
            generateRoom(data);

            initializeModal(data);
        }
    };
})