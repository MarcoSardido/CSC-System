import { connection } from '../../liveConfig.js';

import { firebase } from '../../firebaseConfig.js';
import { getFirestore, doc, collection, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

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

    const checkIfRoomIsAvailable = doc(db, `LiveSession/sessionID_${liveRoomID}`)
    onSnapshot(checkIfRoomIsAvailable, doc => {
        if (doc.data().sessionStatus === 'Closed') {
            alert('This room has been closed by the seller. Redirecting to Dashboard!');
            window.location.assign(`/customercenter`);
        } else if (doc.data().sessionStatus === 'Market') {
            alert('This room has been closed by the seller. Redirecting to MarketPlace!');
            window.location.assign(`/customercenter/marketplace/room/${liveRoomID}`);
        }
    })

    const addUserCount = async (uid, roomID) => {

        //* CUSTOMER COLLECTION
        const docRef = doc(db, `Customers/${uid}`);
        const docData = await getDoc(docRef);

        //* LIVE SESSION COLLECTION -> SUB-COLLECTION: sessionUsers
        const subColRef = doc(db, `LiveSession/sessionID_${roomID}/sessionUsers/${uid}`)
        await setDoc(subColRef, {
            uid: docData.id,
            displayName: docData.data().displayName,
            fullName: docData.data().fullName
        })
    }

    const removeUserCount = async (uid, roomID) => {

        //* LIVE SESSION COLLECTION -> SUB-COLLECTION: sessionUsers
        const subColRef = doc(db, `LiveSession/sessionID_${roomID}/sessionUsers/${uid}`)
        await deleteDoc(subColRef);
    }

    //! ----------------------------------------------------------------------------------------
    //                                     Script Function
    //! ----------------------------------------------------------------------------------------

    // Exit Live
    const btnExit = document.getElementById('btnExit');
    btnExit.addEventListener('click', () => {
        removeUserCount(trimmedUID, liveRoomID).then(() => {
            window.location.assign(`/customercenter`)
        })
    })

    // Live Video
    const videoContainer = document.getElementById('video-container');
    connection.onstream = (event) => {
        let video = event.mediaElement;
        videoContainer.appendChild(video);
    }

    connection.checkPresence(liveRoomID, (isRoomExist, roomid) => {
        if (!(isRoomExist === true)) return alert(`There is no room with ID: ${roomid} or Name: ${liveRoomID}`)
        connection.join(roomid);
    });

    addUserCount(trimmedUID, liveRoomID)
})