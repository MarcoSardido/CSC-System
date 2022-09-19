import { addUser, removeUser } from './Api/users.js';

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    const urlOrigin = window.location.pathname;
    const getRoomId = urlOrigin.split('/');
    const liveRoomID = getRoomId[getRoomId.length - 1];

    //* ----------------------------------------------------------------------------------------
    //  ---------------------------------- Global Selectors ------------------------------------ 
    //* ---------------------------------------------------------------------------------------- 
    const btnShowCart = document.getElementById('btnCart');
    const cartDropdownMenu = document.getElementById('dropdownCart');

    const btnExitMarket = document.getElementById('btnExitMarket');


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

    //? Add customer when joined 
    addUser(trimmedUID, liveRoomID)
})