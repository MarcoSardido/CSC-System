import { connection } from '../../liveConfig.js';

import { addUserCount, removeUserCount } from './Api/live.js';

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    const urlOrigin = window.location.pathname;
    const getRoomId = urlOrigin.split('/');
    const liveRoomID = getRoomId[getRoomId.length - 1];

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
        alert(`Successfully Joined the room: ${roomid}.`)

    });


    addUserCount(trimmedUID, liveRoomID)
})