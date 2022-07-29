import { addUserCount, removeUserCount } from './Api/live.js';

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const liveSessionID = urlParams.get('session')

    const btnExit = document.getElementById('btnExit');
    btnExit.addEventListener('click', () => {
        removeUserCount(trimmedUID, liveSessionID).then(() => {
            window.location.assign(`/customercenter`)
        })
    })

    addUserCount(trimmedUID, liveSessionID)
})