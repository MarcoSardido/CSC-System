import { connection } from '../../liveConfig.js';

import { firebase } from '../../firebaseConfig.js';
import { getFirestore, doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase)

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    const urlOrigin = window.location.pathname;
    const getRoomId = urlOrigin.split('/');
    const liveRoomID = getRoomId[getRoomId.length - 1];

    //! ----------------------------------------------------------------------------------------
    //                                     Firebase Functions
    //! ----------------------------------------------------------------------------------------
    const realTimeViewerCount = async (roomID) => {
        let viewers = 0;

        try {
            //* LIVE SESSION COLLECTION -> SUB-COLLECTION: sessionUsers
            const subColRef = collection(db, `LiveSession/sessionID_${roomID}/sessionUsers`)

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

        } catch (error) {
            console.error(`Firestore Error: @realTimeViewerCount -> ${error.message}`)
        }
    }

    const endLiveSession = async (roomID) => {
        const removeViewers = [];

        try {
            //* LIVE SESSION COLLECTION

            // Check if there are viewers left
            const liveSessionUsersColRef = collection(db, `LiveSession/sessionID_${roomID}/sessionUsers`);
            const liveSessionUsersCollection = await getDocs(liveSessionUsersColRef);
            liveSessionUsersCollection.forEach(user => {
                removeViewers.push(user.id)
            })

            for (const userIndex of removeViewers) {
                await deleteDoc(doc(db, `LiveSession/sessionID_${roomID}/sessionUsers/${userIndex}`));
            }

            // Close Live
            const liveSessionColRef = doc(db, `LiveSession/sessionID_${roomID}`);
            await updateDoc(liveSessionColRef, {
                sessionOpen: false
            })

        } catch (error) {
            console.error(`Firestore Error: @endLiveSession -> ${error.message}`)
        }
    }

    const liveSessionDuration = async (roomID) => {

        try {
            //* LIVE SESSION COLLECTION
            const liveSessionColRef = doc(db, `LiveSession/sessionID_${roomID}`);
            const liveSessionColDoc = await getDoc(liveSessionColRef);
            const durationData = liveSessionColDoc.data().sessionDuration;

            return durationData;
        } catch (error) {
            console.error(`Firestore Error: @liveSessionDuration -> ${error.message}`)
        }
    }




    //! ----------------------------------------------------------------------------------------
    //                                     Script Function
    //! ----------------------------------------------------------------------------------------

    // Live Countdown
    const timerLabel = document.getElementById('lblTimer');

    let interval = null, totalSeconds;
    liveSessionDuration(liveRoomID).then(result => {
        let time = result.split(' ')[0];
        let label = result.split(' ')[1];

        if (label === 'Minutes') {
            const sec = 60;
            totalSeconds = Number(time) * sec;
        } else {
            const sec = 3600;
            totalSeconds = Number(time) + sec;
        }
    })

    const countdownTimer = () => {
        totalSeconds--;

        // Format timer
        let hrs = Math.floor(totalSeconds / 3600);
        let mins = Math.floor((totalSeconds - (hrs * 3600)) / 60);
        let secs = totalSeconds % 60;

        if (secs < 10) secs = '0' + secs;
        if (mins < 10) mins = '0' + mins;
        if (hrs < 10) hrs = '0' + hrs;

        if (totalSeconds === 0) {
            clearInterval(interval)
            interval = null;

            alert('Time is done')
        }

        timerLabel.innerText = `${hrs}:${mins}:${secs}`;
    }

    const startTimer = () => {
        if (interval) {
            return
        }
        interval = setInterval(countdownTimer, 1000)
    }


    // Live Video
    const videoContainer = document.getElementById('video-container');
    connection.onstream = (event) => {
        let video = event.mediaElement;
        video.removeAttribute('controls');
        videoContainer.appendChild(video);
    }

    connection.open(liveRoomID, (isRoomOpened, roomid, error) => {
        if (error) return console.error(error);

        if (isRoomOpened === true) {
            console.log(`Successfully created the room: ${roomid}`);
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

        // Remove room in customer dashboard
        endLiveSession(liveRoomID);

        // Back to seller dashboard
        window.location.assign(`/sellercenter`);
    })

    // Viewer count
    const displayTotalViewers = (count) => {
        document.getElementById('lblViewCount').innerHTML = count;
    }

    realTimeViewerCount(liveRoomID)
    startTimer();
})