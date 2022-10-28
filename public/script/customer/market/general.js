import { addUser, removeUser, roomExpire } from './Api/users.js';

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    const urlOrigin = window.location.pathname;
    const getRoomId = urlOrigin.split('/');
    const liveRoomID = getRoomId[getRoomId.length - 1];

    //* ----------------------------------------------------------------------------------------
    //  ---------------------------------- Global Selectors ------------------------------------ 
    //* ---------------------------------------------------------------------------------------- 
    const lblTimer = document.getElementById('lblTimer')
    const btnShowCart = document.getElementById('btnCart');
    const cartDropdownMenu = document.getElementById('dropdownCart');

    const btnExitMarket = document.getElementById('btnExitMarket');

    // Timer
    const TIMER_DURATION = 1800; // 30 Minutes
    const timerStep = () => {
        const timestamp = Date.now() / 1000;
        const timeLeft = (TIMER_DURATION - 1) - Math.round(timestamp) % TIMER_DURATION;

        // Format timer
        let hrs = Math.floor(timeLeft / 3600);
        let mins = Math.floor((timeLeft - (hrs * 3600)) / 60);
        let secs = timeLeft % 60;

        if (secs < 10) secs = '0' + secs;
        if (mins < 10) mins = '0' + mins;
        if (hrs < 10) hrs = '0' + hrs;

        if (timeLeft <= 300) {
            lblTimer.style.color = 'red';
        } else {
            lblTimer.style.color = 'black';
        }

        if (timeLeft === 0) {
            alert('Market place closed');
            window.location.assign('/customercenter');
            roomExpire(trimmedUID, liveRoomID);
        }

        lblTimer.innerText = `${hrs}:${mins}:${secs}`;

        const timeCorrection = Math.round(timestamp) - timestamp
        setTimeout(timerStep, timeCorrection * 1000 + 1000)
    }

    // Exit Marketplace
    btnExitMarket.addEventListener('click', () => {
        removeUser(trimmedUID, liveRoomID).then(() => {
            window.location.assign('/customercenter');
        })
    })


    // Show Cart Function
    btnShowCart.addEventListener('click', () => {
        btnShowCart.classList.add('active')
        toggleCartShow();
    })

    const toggleCartShow = () => {
        if (!btnShowCart.classList.contains('active')) {
            cartDropdownMenu.addEventListener('mouseleave', () => {
                btnShowCart.classList.remove('active')
            })
        }
    }

    toggleCartShow();
    timerStep();

    //? Add customer when joined 
    addUser(trimmedUID, liveRoomID)
})