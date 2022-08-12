import { connection } from '../../liveConfig.js';

import { firebase } from '../../firebaseConfig.js';
import { getFirestore, doc, collection, getDoc, getDocs, setDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase)

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    const urlOrigin = window.location.pathname;
    const getRoomId = urlOrigin.split('/');
    const liveRoomID = getRoomId[getRoomId.length - 1];

    //! -------------------------------------------------------------
    //                         DB Functions
    //! -------------------------------------------------------------
    const realTimeViewerCount = async (sid) => {
        let viewers = 0;

        //* LIVE SESSION COLLECTION -> SUB-COLLECTION: sessionUsers
        const subColRef = collection(db, `LiveSession/sessionID_${sid}/sessionUsers`)

        onSnapshot(subColRef, (snapshot) => {
            snapshot.docChanges().forEach(change => {
                if (!change.doc.data().hasOwnProperty('sample')) {
                    if (change.type === "added") {
                        viewers++;
                        displayTotalViewers(viewers)
                    }

                    if (change.type === "removed") {
                        viewers--;
                        displayTotalViewers(viewers)
                    }
                }
            })
        })
    }

    // Live Video
    const videoContainer = document.getElementById('video-container');
    connection.onstream = (event) => {
        let video = event.mediaElement;

        videoContainer.appendChild(video);
    }

    connection.open(liveRoomID, (isRoomOpened, roomid, error) => {
        if (error) return console.error(error);

        if (isRoomOpened === true) {
            alert(`Successfully created the room: ${roomid}`);
        }
    });


    // Close Live Session
    const btnExit = document.getElementById('btnExit');
    btnExit.addEventListener('click', () => {

        // Disconnect all viewers
        connection.getAllParticipants().forEach(participantId => {
            connection.disconnectWith(participantId);
        });

        // Shut down live
        connection.attachStreams.forEach(localStream => {
            localStream.stop();
        });

        // Close socket
        connection.closeSocket();

        // Back to seller dashboard
        window.location.assign(`/sellercenter`);
    })

    const displayTotalViewers = (count) => {
        document.getElementById('lblViewCount').innerHTML = count;
    }

    realTimeViewerCount(liveRoomID)
})