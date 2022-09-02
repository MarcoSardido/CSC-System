import { getLiveRooms } from './Api/liveSession.js';

$(document).ready(() => {

    // Get all rooms and loop each of them
    const getSelectedRoom = (data) => {
        const availableRooms = document.querySelectorAll('.live')
        for (const roomIndex of availableRooms) {
            roomIndex.addEventListener('click', () => {
                showModal(data, roomIndex.dataset.roomId);
            })
        }
    }

    // Modal before joining room
    const showModal = (data, id) => {
        const modalContent = document.querySelector('.modal-content');
        let content = ``;

        for (const roomIndex of data) {
            if (roomIndex.sessionID !== id) continue;

            content += `
                <div class="modal-header">
                    <h5 class="modal-title" id="joinModalLabel">You're joining ${roomIndex.roomName}</h5>
                </div>
                <div class="modal-body">
                    <div class="customer-option">
                        <div class="option-tooltip" data-toggle="tooltip" data-placement="top" title="Enabling this will hide your name and photo to the seller when you buy, but you can't use live chat.">
                            <ion-icon name="help-circle-outline"></ion-icon>
                        </div>
                        <input type="checkbox" class="option-checkbox">
                        <p class="chkLabel">Be anonymous buyer</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="btnJoinLive" data-live-id="${id}">Join Live Session</button>
                </div>
            `;
        }
        if (modalContent.hasChildNodes) $('.modal-content').empty();

        modalContent.insertAdjacentHTML('beforeend', content);
        $('#joinRoomModal').modal('show');
        joinRoom();
    }

    // Join room
    const joinRoom = () => {
        const btnJoinLive = document.getElementById('btnJoinLive');
        btnJoinLive.addEventListener('click', () => {
            const sessionID = btnJoinLive.dataset.liveId;
            const trimmedSessionID = sessionID.split('_')[1]
            window.location.assign(`${window.location.href}/live/room/${trimmedSessionID}`)
        })
    }

    //? API Call
    getLiveRooms().then(result => {
        getSelectedRoom(result);
    })
})