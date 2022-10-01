import { demo } from './Api/general.js';

$(document).ready(() => {

    const a = document.getElementById('test');
    a.addEventListener('click', () => {
        demo();
    })
})