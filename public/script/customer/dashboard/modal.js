import { getLiveRooms } from './Api/liveSession.js'

$(document).ready(() => {

    // Get all rooms and loop each of them
    const getSelectedRoom = (data) => {
        const availableRooms = document.querySelectorAll('.room')
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




    // Display available rooms
    const displayRooms = (data) => {
        const size = data.length;

        if (size > 0) {
            $('.no-session').remove();
            generateRoom(data)
        } else {
            $('.live-rooms-container').append(noRoomText())
        }
    }

    const noRoomText = () => {
        return `<div class="no-session">
                    <p class="main-text">
                        There are no live session available at the moment.
                    </p>
                    <p class="sub-text">
                        Please check again later.
                    </p>
                </div>
                `;
    }

    const generateRoom = (data) => {
        const displayContainer = document.querySelector('.live-rooms-container');
        const size = data.length;
        if (size === 1) {
            const content = `
                <div class="row row1">
                    <div class="col-8 room featured" data-room-id="${data[0].sessionID}"
                        style="background-image: url(${data[0].bannerImg})">
                        <div class="upper">
                            <div class="fixed-logo-frame">
                                <img src="${data[0].logoImg}" alt="logo">
                            </div>
                        </div>
                        <div class="lower">
                            <div class="room-title">
                                <p class="fixed-live-status">Live</p>
                                <p class="store-name">${data[0].roomName} (${data[0].eventName})</p>
                            </div>
                            <div class="room-desc">
                                <p class="store-desc">${data[0].eventDesc}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            displayContainer.insertAdjacentHTML('beforeend', content)
        } else {
            const content = ``;
            for (const [index, value] of data.entries()) {

                if (index === 0) {
                    content += `
                        <div class="row row1">
                            <div class="col-8 room featured" data-room-id="${value.sessionID}"
                                style="background-image: url(${value.bannerImg})">
                                <div class="upper">
                                    <div class="fixed-logo-frame">
                                        <div class="logo">
                                            <img src="${value.logoImg}" alt="logo">
                                        </div>
                                    </div>
                                </div>
                                <div class="lower">
                                    <div class="room-title">
                                        <p class="fixed-live-status">Live</p>
                                        <p class="store-name">${value.roomName} (${value.eventName})</p>
                                    </div>
                                    <div class="room-desc">
                                        <p class="store-desc">${value.eventDesc}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } else if (index > 0 && index < 3) {
                    if (size === 3) {
                        content += `
                            <div class="row row2">
                                <div class="col-5 room" data-room-id="${value.sessionID}"
                                    style="background-image: url(${value.bannerImg})">
                                    <div class="upper">
                                        <div class="fixed-logo-frame">
                                            <img src="${data[0].logoImg}" alt="logo">
                                        </div>
                                    </div>
                                    <div class="lower">
                                        <div class="room-title">
                                            <p class="fixed-live-status">Live</p>
                                            <p class="store-name">${value.roomName} (${value.eventName})</p>
                                        </div>
                                        <div class="room-desc">
                                            <p class="store-desc">${value.eventDesc}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-5 room" data-room-id="${value.sessionID}"
                                    style="background-image: url(${value.bannerImg})">
                                    <div class="upper">
                                        <div class="fixed-logo-frame">
                                            <div class="logo">
                                                <img src="${value.logoImg}" alt="logo">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="lower">
                                        <div class="room-title">
                                            <p class="fixed-live-status">Live</p>
                                            <p class="store-name">${value.roomName} (${value.eventName})</p>
                                        </div>
                                        <div class="room-desc">
                                            <p class="store-desc">${value.eventDesc}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        `;
                    } else {
                        content += `
                            <div class="row row2">
                                <div class="col-5 room" data-room-id="${value.sessionID}"
                                    style="background-image: url(${value.bannerImg})">
                                    <div class="upper">
                                        <div class="fixed-logo-frame">
                                            <img src="${value.logoImg}" alt="logo">
                                        </div>
                                    </div>
                                    <div class="lower">
                                        <div class="room-title">
                                            <p class="fixed-live-status">Live</p>
                                            <p class="store-name">${value.roomName} (${value.eventName})</p>
                                        </div>
                                        <div class="room-desc">
                                            <p class="store-desc">${value.eventDesc}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-5></div>
                            </div>
                        `;
                    }
                } else {
                    if (size === 5) {
                        content += `
                            <div class="row row3">
                                <div class="col-5 room" data-room-id="${value.sessionID}"
                                    style="background-image: url(${value.bannerImg})">
                                    <div class="upper">
                                        <div class="fixed-logo-frame">
                                            <img src="${value.logoImg}" alt="logo">
                                        </div>
                                    </div>
                                    <div class="lower">
                                        <div class="room-title">
                                            <p class="fixed-live-status">Live</p>
                                            <p class="store-name">${value.roomName} (${value.eventName})</p>
                                        </div>
                                        <div class="room-desc">
                                            <p class="store-desc">${value.eventDesc}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-5 room" data-room-id="${value.sessionID}"
                                    style="background-image: url(${value.bannerImg})">
                                    <div class="upper">
                                        <div class="fixed-logo-frame">
                                            <div class="logo">
                                                <img src="${value.logoImg}" alt="logo">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="lower">
                                        <div class="room-title">
                                            <p class="fixed-live-status">Live</p>
                                            <p class="store-name">${value.roomName} (${value.eventName})</p>
                                        </div>
                                        <div class="room-desc">
                                            <p class="store-desc">${value.eventDesc}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        `;
                    } else {
                        content += `
                            <div class="row row3">
                                <div class="col-5 room" data-room-id="${value.sessionID}"
                                    style="background-image: url(${value.bannerImg})">
                                    <div class="upper">
                                        <div class="fixed-logo-frame">
                                            <img src="${value.logoImg}" alt="logo">
                                        </div>
                                    </div>
                                    <div class="lower">
                                        <div class="room-title">
                                            <p class="fixed-live-status">Live</p>
                                            <p class="store-name">${value.roomName} (${value.eventName})</p>
                                        </div>
                                        <div class="room-desc">
                                            <p class="store-desc">${value.eventDesc}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-5></div>
                            </div>
                        `;
                    }
                }
            }
        }
    }


    // Api
    getLiveRooms().then(result => {
        displayRooms(result);
        getSelectedRoom(result);
    })
})