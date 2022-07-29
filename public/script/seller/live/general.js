import { firebase } from '../../firebaseConfig.js';
import { getFirestore, doc, collection, getDoc, getDocs, setDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase)

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const liveSessionID = urlParams.get('session')


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


    const btnExit = document.getElementById('btnExit');
    btnExit.addEventListener('click', () => {
        window.location.assign(`/sellercenter`)
    })

    const displayTotalViewers = (count) => {
        document.getElementById('lblViewCount').innerHTML = count;
    }

    realTimeViewerCount(liveSessionID)
})