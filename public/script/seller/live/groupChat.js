import { firebase } from '../../firebaseConfig.js';
import { getFirestore, doc, collection, getDoc, getDocs, deleteDoc, setDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase)

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    const urlOrigin = window.location.pathname;
    const getRoomId = urlOrigin.split('/');
    const liveRoomID = getRoomId[getRoomId.length - 1];


    //! ============================== Firebase Functions ================================  !// 

    //? Checks realtime if customer joins.
    // ::
    //* LIVE SESSION COLLECTION -> SUB-COLLECTION: sessionUsers
    const usersSubColRef = collection(db, `LiveSession/sessionID_${liveRoomID}/sessionUsers`);
    onSnapshot(usersSubColRef, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                getCustomer(change.doc.data().uid, snapshot.size);
            }

            if (change.type === "removed") {
                removeCustomer(change.doc.data().uid)
            }
        });
    })

    const getCustomer = async (uid, collectionSize) => {
        const customerObj = {};

        try {
            //* CUSTOMER COLLECTION
            const customerDocRef = doc(db, `Accounts/customer_${uid}`);
            const customerDocument = await getDoc(customerDocRef);

            customerObj.uid = uid;
            customerObj.name = customerDocument.data().displayName;
            customerObj.photo = `data:${customerDocument.data().imgType};base64,${customerDocument.data().userPhoto}`;

            addCustomer(customerObj, collectionSize)

        } catch (error) {
            console.error(`Firestore Error -> @getCustomer: ${error.message}`)
        }


    }

    const addChat = async (uid, data, sessionID) => {
        const currentDateAndTime = new Date();
        const uniqueID = generateId();

        try {
            // Seller Collection
            const sellerRef = doc(db, `Sellers/${uid}`)
            const sellerData = await getDoc(sellerRef);

            // Accounts Collection
            const accountsRef = doc(db, `Accounts/seller_${uid}`)
            const accountData = await getDoc(accountsRef);

            // LiveSession Collection
            const chatRef = doc(db, `LiveSession/sessionID_${sessionID}/sessionChat/chatID_${uniqueID}`)
            setDoc(chatRef, {
                content: data,
                createdAt: currentDateAndTime,
                displayName: sellerData.data().displayName,
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

    const muteUser = async (uid, sessionID) => {
        try {
            //* LIVE SESSION -> SUB-COLLECTION: sessionUsers
            const usersSubColRef = doc(db, `LiveSession/sessionID_${sessionID}/sessionUsers/${uid}`);
            await setDoc(usersSubColRef, {
                isMuted: true,
            }, { merge: true });

        } catch (error) {
            console.error(`Firestore Error -> @muteUser -> ${error.message}`)
        }
    }

    const unMuteUser = async (uid, sessionID) => {
        try {
            //* LIVE SESSION -> SUB-COLLECTION: sessionUsers
            const usersSubColRef = doc(db, `LiveSession/sessionID_${sessionID}/sessionUsers/${uid}`);
            await setDoc(usersSubColRef, {
                isMuted: false,
            }, { merge: true });

        } catch (error) {
            console.error(`Firestore Error -> @unMuteUser -> ${error.message}`)
        }
    }

    const removeUser = async (uid, sessionID) => {
        try {
            //* COLLECTION: LiveSession -> SUB-COLLECTION: sessionUsers
            const userDocRef = doc(db, `LiveSession/sessionID_${sessionID}/sessionUsers/${uid}`);
            await deleteDoc(userDocRef);

        } catch (error) {
            console.error(`Firestore Error -> @removeUser: ${error.message}`)
        }
    }

    const reportUser = async (uid, { type, detail, cid }) => {
        const uniqueID = generateId();
        const currentDate = stringDateFormat();

        try {
            //* COLLECTION: Customers
            const customerDocRef = doc(db, `Customers/${cid}`);
            const customerDocument = await getDoc(customerDocRef);

            const customer = customerDocument.data().fullName === '' ? customerDocument.data().displayName : customerDocument.data().fullName;

            //* COLLECTION: Reports
            const reportsDocRef = doc(db, `Reports/ticket_${uniqueID}`);
            await setDoc(reportsDocRef, {
                id: uniqueID,
                complainantID: uid,
                reportedCustomerID: cid,
                reportedCustomerName: customer,
                reportType: type,
                reportDetail: detail,
                reportPlaced: currentDate,
                status: 'Pending'
            });

            //* COLLECTION: Sellers -> SUB-COLLECTION: Reports
            const sellerReportDocRef = doc(db, `Sellers/${uid}/Reports/ticket_${uniqueID}`);
            await setDoc(sellerReportDocRef, {
                id: uniqueID,
                reportedCustomerID: cid,
                reportedCustomerName: customer,
                reportType: type,
                reportDetail: detail,
                reportPlaced: currentDate,
                status: 'Pending'
            })
            
        } catch (error) {
            console.error(`Firestore Error -> @removeUser: ${error.message}`)
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
        const date = new Date();
        const formattedDate = date.toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        }).replace(/ /g, ' ');
        return formattedDate;
    }


    //* ================================ Global Selectors ================================== *//
    const customerContainer = document.getElementById('dynamicCustomerContainer');

    // :: Report Modal
    const reportButton = document.getElementById('btnReportCustomer');

    let customerCounter = 1;
    const addCustomer = (userData, size) => {
        const CUSTOMER_TEMPLATE = ` 
            <div class="customer" data-uid="${userData.uid}">
                <div class="cust-info">
                    <img src="${userData.photo}" alt="${userData.name}">
                    <p>${userData.name}</p>
                </div>
                <div class="cust-control">
                    <div class="customer-mute">
                        <ion-icon name="volume-high"></ion-icon>
                    </div>
                    <div class="customer-report">
                        <ion-icon name="warning"></ion-icon>
                    </div>
                    <div class="customer-remove">
                        <ion-icon name="person-remove"></ion-icon>
                    </div> 
                </div>
            </div>
        `;
        
        $("#noCustomer").remove();
        customerContainer.insertAdjacentHTML('beforeend', CUSTOMER_TEMPLATE);

        if (customerCounter === size) {
            initCustomerButtons();
        } else {
            customerCounter++;
        }
    }

    const removeCustomer = (uid) => {
        const customerList = customerContainer.children;

        for (let customerIndex = 0; customerIndex < customerList.length; customerIndex++) {
            const elUid = customerList[customerIndex].dataset.uid;

            if (elUid === uid) {
                removeUser(uid, liveRoomID).then(() => {
                    customerContainer.removeChild(customerContainer.children[customerIndex]);

                    if (customerList.length === 0) {
                        const NO_CUSTOMER = `
                            <div id="noCustomer" class="no-customer">
                                You have no viewers 😭
                            </div>
                        `;

                        customerContainer.insertAdjacentHTML('beforeend', NO_CUSTOMER)
                    }
                })
            }
        }
    }


    const initCustomerButtons = () => {
        const allMuteButtons = document.querySelectorAll('.customer-mute');
        const allRemoveButtons = document.querySelectorAll('.customer-remove');
        const allReportButtons = document.querySelectorAll('.customer-report');

        // Mute customer
        for (const muteIndex of allMuteButtons) {
            muteIndex.addEventListener('click', () => {
                const mainParentEl = muteIndex.parentElement.parentElement;
                const uid = mainParentEl.dataset.uid;
                const icon = muteIndex.children[0];

                if (icon.getAttribute('name') === 'volume-high') {
                    icon.setAttribute("name", "volume-mute");
                    muteUser(uid, liveRoomID)

                } else {
                    icon.setAttribute("name", "volume-high");
                    unMuteUser(uid, liveRoomID)
                }
            })
        }

        // Report Customer
        for (const reportIndex of allReportButtons) {
            reportIndex.addEventListener('click', () => {
                const mainParentEl = reportIndex.parentElement.parentElement;
                const uid = mainParentEl.dataset.uid;

                $('#reportModal').modal('show');

                reportButton.addEventListener('click', () => {
                    const reportObj = {};
                    
                    const reportDetail = document.getElementById('reportDetail');
                    const reportRadioButtons = document.querySelectorAll('[name="rdoReport"]');
                    for (const radioIndex of reportRadioButtons) {
                        if (radioIndex.checked) {
                            reportObj.type = radioIndex.value;
                            reportObj.detail = reportDetail.value;
                            reportObj.cid = uid;
                        }
                    }

                    reportUser(trimmedUID, reportObj).then(() => {
                        $('#reportModal').modal('hide');
                        reportRadioButtons[0].checked = true;
                        reportDetail.value = null;
                    })
                })
            })
        }

        // Remove customer
        for (const removeIndex of allRemoveButtons) {
            removeIndex.addEventListener('click', () => {
                const mainParentEl = removeIndex.parentElement.parentElement;
                const uid = mainParentEl.dataset.uid;

                removeCustomer(uid)
            })
        }
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
                getRealTimeData(liveRoomID)
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

    // Adding Chat
    const txtChatInput = document.getElementById('txtInputChat');
    txtChatInput.addEventListener('keypress', e => {
        if (e.key !== 'Enter') return;
        if (txtChatInput.value === '') return;

        inputFunction(txtChatInput.value);
    })
    const btnChatInput = document.getElementById('btnInputChat');
    btnChatInput.addEventListener('click', () => {
        if (txtChatInput.value === '') return;

        inputFunction(txtChatInput.value);
    })


    // Displaying Chat
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
            div.setAttribute('uid', uid);

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

    displayMessage();
})