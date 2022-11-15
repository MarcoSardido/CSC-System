//! -------------------------------------------------------------
//                          API
//! -------------------------------------------------------------

import { firebase } from '../../firebaseConfig.js';
import { getFirestore, doc, collection, getDoc, getDocs, setDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase)

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    const urlOrigin = window.location.pathname;
    const getRoomId = urlOrigin.split('/');
    const liveRoomID = getRoomId[getRoomId.length - 1];

    const isAnonymousBuyer = window.location.search.split('=')[1];
    let userIsMuted = false;


    //? Check if user is muted by the seller.
    //* LIVE SESSION -> SUB-COLLECTION: sessionUsers
    const usersSubColRef = doc(db, `LiveSession/sessionID_${liveRoomID}/sessionUsers/${trimmedUID}`);
    onSnapshot(usersSubColRef, doc => {
        if (isAnonymousBuyer) return;

        const isMuted = doc.data().isMuted;
        userIsMuted = isMuted;
        checkUserIfMuted(isMuted)
    });

    const addChat = async (uid, data, sessionID) => {
        const currentDateAndTime = new Date();
        const uniqueID = generateId();

        try {
            // Customer Collection
            const customerRef = doc(db, `Customers/${uid}`)
            const customerData = await getDoc(customerRef);

            // Accounts Collection
            const accountsRef = doc(db, `Accounts/customer_${uid}`)
            const accountData = await getDoc(accountsRef);

            // LiveSession Collection
            const chatRef = doc(db, `LiveSession/sessionID_${sessionID}/sessionChat/chatID_${uniqueID}`)
            setDoc(chatRef, {
                content: data,
                createdAt: currentDateAndTime,
                displayName: customerData.data().displayName,
                uid: uid,
                photo: `data:${accountData.data().imgType};base64,${accountData.data().userPhoto}`
            })

        } catch (error) {
            console.error(`Firestore Error: @addChat -> ${error.message}`)
        }
    }

    const getRealTimeData = async (sessionID) => {
        try {
            // LiveSession Collection
            const chatRef = collection(db, `LiveSession/sessionID_${sessionID}/sessionChat`)
            const chatQuery = query(chatRef, orderBy('createdAt'), limit(12))

            // Realtime watcher
            onSnapshot(chatQuery, (snapshot) => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === "added") {
                        const message = change.doc.data();
                        getAllChatData(change.doc.id, message.content, message.createdAt, message.displayName, message.uid, message.photo)
                    }
                });
            });

        } catch (error) {
            console.error(`Firestore Error: @getRealTimeData -> ${error.message}`)
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


    const inputFunction = (data) => {
        const chatValue = data.trim();

        if (profanityFilter(chatValue)) {
            txtChatInput.value = null;
            txtChatInput.placeholder = 'Bad word detected';
            txtChatInput.classList.add('error');

            setTimeout(() => {
                txtChatInput.classList.remove('error');
                txtChatInput.placeholder = 'Aa';
            }, 3000)
            
        } else {
            addChat(trimmedUID, chatValue, liveRoomID).then(() => {
                txtChatInput.value = null;
                displayMessage()
            })
        }
        
    }

    const profanityFilter = (word) => {
        const badWords = ['die', 'fuck', 'hell', 'ass', 'asshole', 'kill'];
        let status = false;

        const format = word.toLowerCase()
        const checkWord = format.split(' ')

        for (const wordIndex of checkWord) {
            if (badWords.includes(wordIndex)) {
                status = true;
                break;
            } 
        }
        return status;
    }

    

    //! -------------------------------------------------------------
    //                          ADDING DATA
    //! -------------------------------------------------------------
    const txtChatInput = document.getElementById('txtInputChat');
    if (isAnonymousBuyer === 'true') {
        txtChatInput.value = null;
        txtChatInput.placeholder = 'Anonymous Buyer Enabled';
        txtChatInput.classList.add('error');
    }
    
    txtChatInput.addEventListener('keypress', e => {
        if (e.key !== 'Enter') return;
        if (txtChatInput.value === '') return;
        if (isAnonymousBuyer === 'true') return txtChatInput.value = null;
        if (userIsMuted) return txtChatInput.value = null;

        inputFunction(txtChatInput.value);
    })

    const btnChatInput = document.getElementById('btnInputChat');
    btnChatInput.addEventListener('click', () => {
        if (txtChatInput.value === '') return;
        if (isAnonymousBuyer === 'true') return txtChatInput.value = null;
        if (userIsMuted) return txtChatInput.value = null;

        inputFunction(txtChatInput.value);
    })

    const checkUserIfMuted = (mute) => {
        if (mute) {
            $('#muteToast').toast('show')
            txtChatInput.setAttribute('disabled', '');
            txtChatInput.value = null;
            txtChatInput.placeholder = `You've been muted by the seller.`;
            txtChatInput.classList.add('error');
        } else {
            txtChatInput.removeAttribute('disabled');
            txtChatInput.placeholder = `Aa`;
            txtChatInput.classList.remove('error');
        }
    }


    //! -------------------------------------------------------------
    //                          DISPLAYING DATA
    //! -------------------------------------------------------------
    const messageListElement = document.querySelector('.conversation');
    const displayMessage = () => {
        getRealTimeData(liveRoomID)
    }

    const MY_MESSAGE_TEMPLATE =
        `<div class="chat-item this-user">
            <div class="message"></div>
        </div>`;

    const OTHER_MESSAGE_TEMPLATE =
        `<div class="chat-item other-user">
            <div class="chat-head">
                <img id="pic" src="" alt="user">
            </div>
            <div class="chat-body">
                <p class="name"></p>
                <div class="message"></div>
            </div>
            
        </div>`;


    const createAndInsertMessage = (chatID, time, uid) => {
        const container = document.createElement('div');

        if (uid === trimmedUID) {
            container.innerHTML = MY_MESSAGE_TEMPLATE;

            const div = container.firstChild;
            div.setAttribute('id', chatID);

            // If timestamp is null, assume we've gotten a brand new message.
            time = time ? new Date(time.seconds * 1000 + time.nanoseconds / 1000000) : Date.now();
            div.setAttribute('timestamp', time);

            // figure out where to insert new message
            const existingMessages = messageListElement.children;
            if (existingMessages.length === 0) {
                messageListElement.appendChild(div);
            } else {
                let messageListNode = existingMessages[0];

                while (messageListNode) {
                    const messageListNodeTime = messageListNode.getAttribute('timestamp');

                    if (!messageListNodeTime) {
                        throw new Error(
                            `Child ${messageListNode.id} has no 'timestamp' attribute`
                        );
                    }

                    if (messageListNodeTime > time) {
                        break;
                    }

                    messageListNode = messageListNode.nextSibling;
                }

                messageListElement.insertBefore(div, messageListNode);
            }

            return div;

        } else {
            container.innerHTML = OTHER_MESSAGE_TEMPLATE;

            const div = container.firstChild;
            div.setAttribute('id', chatID);

            // If timestamp is null, assume we've gotten a brand new message.
            time = time ? new Date(time.seconds * 1000 + time.nanoseconds / 1000000) : Date.now();
            div.setAttribute('timestamp', time);

            // figure out where to insert new message
            const existingMessages = messageListElement.children;
            if (existingMessages.length === 0) {
                messageListElement.appendChild(div);
            } else {
                let messageListNode = existingMessages[0];

                while (messageListNode) {
                    const messageListNodeTime = messageListNode.getAttribute('timestamp');

                    if (!messageListNodeTime) {
                        throw new Error(
                            `Child ${messageListNode.id} has no 'timestamp' attribute`
                        );
                    }

                    if (messageListNodeTime > time) {
                        break;
                    }

                    messageListNode = messageListNode.nextSibling;
                }

                messageListElement.insertBefore(div, messageListNode);
            }

            return div;
        }
    }


    const getAllChatData = (chatID, message, time, name, uid, photo) => {
        const div = document.getElementById(chatID) || createAndInsertMessage(chatID, time, uid)

        let messageElement = div.querySelector('.message');

        if (uid !== trimmedUID) {
            if (photo !== 'data:;base64,') {
                div.querySelector('#pic').src = photo;
            } else {
                div.querySelector('#pic').src = `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png`;
            }
            div.querySelector('.name').textContent = name;
        }

        messageElement.textContent = message;

        // Replace all line breaks by <br>.
        messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');

        // Show the card fading-in and scroll to view the new message.
        $(".conversation").stop().animate({ scrollTop: $(".conversation")[0].scrollHeight }, 1000);
    }

    displayMessage()
});