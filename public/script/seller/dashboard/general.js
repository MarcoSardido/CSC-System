import { firebase } from '../../firebaseConfig.js';
import { getFirestore, doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase)

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    //! TODO: Show toast in seller dashboard when customer buys product in its Marketplace.
    let onGoingMarketPlace;
    const checkCurrentMarketPlace = async (uid) => {
        const sellerSessionsArray = [], liveSessionArray = [];

        try {
            //* SELLER COLLECTION -> SUB-COLLECTION: LiveSessions
            const sellerLiveSubColRef = collection(db, `Sellers/${uid}/LiveSessions`);
            const sellerLiveCollection = await getDocs(sellerLiveSubColRef);
            sellerLiveCollection.forEach(doc => {
                sellerSessionsArray.push(doc.id);
            })

            //* COLLECTION: LiveSession
            const liveColRef = collection(db, `LiveSession`);
            const liveCollection = await getDocs(liveColRef);
            liveCollection.forEach(doc => {
                liveSessionArray.push(doc.id);
            })

            for (const sellerSessionIndex of sellerSessionsArray) {
                for (const liveSessionIndex of liveSessionArray) {
                    if (sellerSessionIndex === liveSessionIndex) {
                        const liveDocRef = doc(db, `LiveSession/${sellerSessionIndex}`);
                        const liveDocument = await getDoc(liveDocRef);

                        if (liveDocument.data().sessionStatus === 'Market') {
                            onGoingMarketPlace = sellerSessionIndex;
                        }
                    }
                }
            }

            initRealtimeListener(onGoingMarketPlace);
        } catch (error) {
            console.error(`Firestore Error -> @checkCurrentMarketPlace: ${error.message}`)
        }
    }

    const initRealtimeListener = (liveSessionID) => {
        try {
            
            //? Show toast if customer added item to cart
            // 
            //* COLLECTION: LiveSession
            const liveDocRef = doc(db, `LiveSession/${liveSessionID}`);
            onSnapshot(liveDocRef, doc => {
                if (doc.data().customer !== '') {
                    showBuyToast(doc.data().customer)
                }
            })

        } catch (error) {
            console.error(`Firestore Error -> @initRealtimeListener: ${error.message}`)
        }
    }

    const verifyDocumentsInfo = document.getElementById('needVerifyInfo');
    const verifyDocumentsInfoText = document.getElementById('needVerifyText');
    verifyDocumentsInfo.addEventListener('mouseenter', () => {
        verifyDocumentsInfoText.style.display = 'block';
    })
    verifyDocumentsInfo.addEventListener('mouseleave', () => {
        verifyDocumentsInfoText.style.display = 'none';
    })

    const showBuyToast = (user) => {
        $('.tost-message').text(`Customer ${user} has bought an item!`);
        $('#buyToast').toast('show')
    }

    checkCurrentMarketPlace(trimmedUID);
})