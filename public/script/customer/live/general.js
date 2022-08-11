import { addUserCount, removeUserCount } from './Api/live.js';

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    const urlOrigin = window.location.pathname;
    const getRoomId = urlOrigin.split('/');
    const liveRoomID = getRoomId[getRoomId.length - 1];

    const btnExit = document.getElementById('btnExit');
    btnExit.addEventListener('click', () => {
        removeUserCount(trimmedUID, liveRoomID).then(() => {
            window.location.assign(`/customercenter`)
        })
    })

    addUserCount(trimmedUID, liveRoomID)
})