import { startLiveSelling, checkLiveSessions } from './Api/startLive.js'

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    const storeName = $('#store').text();
    const trimmedStoreName = storeName.trim();

    const startTime = document.getElementById('inputStartTime');
    const checkTimeSelection = [];
    
    startTime.addEventListener('change', () => {
        const date = new Date();
        const hours = date.getHours();
        const splitTimeValue = startTime.value.split(':')[0];

        if (splitTimeValue > hours) {
            const rooms = checkTimeSelection;
            const selectedTime = `${splitTimeValue}:00`;

            if (rooms.length > 0) {
                for (const roomIndex of rooms) {
                    if (roomIndex.time === selectedTime) {
                        if (roomIndex.numberOfRooms !== 5) {
                            startTime.value = selectedTime;
                            break;
                        } else {
                            alert(`Time: ${roomIndex.time} already has ${roomIndex.numberOfRooms} waiting rooms. Please select another time.`);
                            startTime.value = `${hours}:00`;
                            break;
                        }
                    }
                }
                startTime.value = selectedTime;
            } else {
                startTime.value = selectedTime;
            }

            

        } else {
            alert('Please select ahead of time');
            startTime.value = `${hours}:00`;
        }
    })

    const computeTime = (start, duration) => {
        let getHour = start.split(':')[0];
        let startTime = Number(getHour);
        let endTime = Number(duration);
        let computedTime;

        if (endTime === 30) {
            computedTime = `${startTime}:${endTime}`;
        } else {
            computedTime = startTime + endTime;
            if (computedTime > 12) {
                computedTime = computedTime - 12;
            }
            computedTime = `${computedTime}:00`;
        }
        return computedTime;
    }

    const checkTimeForWaiting = (roomTimeData) => {
        let current, counter = 0;
    
        const roomTime = roomTimeData;
        roomTime.sort().reverse();
        for (let waitingIndex = 0; waitingIndex < roomTime.length; waitingIndex++) {
            if (current === roomTime[waitingIndex]) {
                continue;
            } else {
                for (let checkWaitingTime = 0; checkWaitingTime < roomTime.length; checkWaitingTime++) {

                    if (roomTime[waitingIndex] === roomTime[checkWaitingTime]) {
                        counter++;
                    }
                }
                checkTimeSelection.push({
                    time: roomTime[waitingIndex],
                    numberOfRooms: counter
                })
                counter = 0;
                current = roomTime[waitingIndex];
            }
        }
    }

    const lblRoomReminder = document.getElementById('dynamicRoomLabel');
    const checkRoomTimeEnd = (roomTimeData) => {
        let current, counter = 0;
        const timeAvailability = [];

        const roomTime = roomTimeData;
        roomTime.sort().reverse();
        for (let endingIndex = 0; endingIndex < roomTime.length; endingIndex++) {
            if (current === roomTime[endingIndex]) {
                continue;
            } else {
                for (let checkWaitingTime = 0; checkWaitingTime < roomTime.length; checkWaitingTime++) {

                    if (roomTime[endingIndex] === roomTime[checkWaitingTime]) {
                        counter++;
                    }
                }
                timeAvailability.push({
                    time: roomTime[endingIndex],
                    numberOfRooms: counter
                })
                counter = 0;
                current = roomTime[endingIndex];
            }
        }
        timeAvailability.reverse()[0];
        return timeAvailability;
    }

    checkLiveSessions().then(result => {
        // Check for rooms if its full
        checkTimeForWaiting(result.waitingRooms);

        // Check for rooms that will end early
        const earlyEnd = checkRoomTimeEnd(result.activeRooms);
        const openRooms = result.activeRooms;
        const roomReminderTemplate = `
            ${openRooms.length > 0 && earlyEnd.length > 0 ? 
                (`<p>There are ${openRooms.length} / 5 slots available | ${earlyEnd.numberOfRooms} room will end at ${earlyEnd.time}`) : 
                (`<p>All slots are available`)
            }
        `;

        lblRoomReminder.insertAdjacentHTML('beforeend', roomReminderTemplate)
    })



    // Modal Slide
    const firstPart = document.querySelector('.first-part');
    const secondPart = document.querySelector('.second-part');
    const slideButtons = document.querySelectorAll('.btnSlide');

    // First Part
    const previewObj = {
        eventName: '',
        eventDesc: '',
        eventLogo: '',
        eventBanner: ''
    };

    const previewContent = (data) => {
        const container = document.querySelector('.prevCont');
        let content = `
            <div class="preview" style="background-image: url('${data.eventBanner}')">
                <div class="upperCont">
                    <div class="logo">
                        <img src="${data.eventLogo}" alt="">
                    </div>
                </div>
                <div class="lowerCont">
                    <div class="storeNameCont">
                        <p class="fixedLiveStatus">Live</p>
                        <p class="storeName">${trimmedStoreName} (${data.eventName})</p>
                    </div>
                    <div class="storeDescCont">
                        <p class="storeDesc">${data.eventDesc}</p>
                    </div>
                </div>
            </div>
        `;
        $('.preview').remove()
        container.insertAdjacentHTML('beforeend', content)
    }

    const previewForm = document.getElementById('preview-form');
    previewForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const firstPartInput = document.querySelectorAll('[name="formInput"]');
        for (const [inputIndex, inputValue] of firstPartInput.entries()) {
            const key = Object.keys(previewObj)[inputIndex];
            if (inputIndex > 1) {
                const imgData = JSON.parse(inputValue.value)
                const imgFormat = `data:${imgData.type};base64,${imgData.data}`
                previewObj[key] = imgFormat;

            } else {
                previewObj[key] = inputValue.value;
            }
        }
        previewObj.storeName = trimmedStoreName;
        previewContent(previewObj)
    })



    // Second Part
    for (const [buttonIndex, buttonValue] of slideButtons.entries()) {
        buttonValue.addEventListener('click', () => {

            if (buttonIndex === 1) {
                firstPart.style.display = 'none';
                secondPart.style.display = 'block';
                buttonValue.classList.add('complete');
                buttonValue.innerText = 'Create Room';
                slideButtons[0].removeAttribute('disabled');
                slideButtons[0].classList.remove('disabled')
            } else {
                firstPart.style.display = 'block';
                secondPart.style.display = 'none';
                slideButtons[1].classList.remove('complete');
                slideButtons[1].innerText = 'Next';
                buttonValue.removeAttribute('disabled');
                buttonValue.classList.add('disabled')
            }

            if (buttonValue.classList.contains('complete')) {
                const secondPartInput = document.querySelectorAll('[name="formInput2"]');
                const lblEndTime = document.getElementById('currentTime');

                secondPartInput[1].addEventListener('change', () => {
                    lblEndTime.textContent = '';
                    lblEndTime.innerText = computeTime(secondPartInput[0].value, secondPartInput[1].value);
                })

                document.querySelector('.complete').addEventListener('click', () => {
                    previewObj.eventStart = secondPartInput[0].value;
                    previewObj.eventDuration = secondPartInput[1].value;
                    previewObj.eventEnd = computeTime(secondPartInput[0].value, secondPartInput[1].value);

                    startLiveSelling(trimmedUID, previewObj).then(res => {
                        window.location.assign(`${window.location.href}/live/room/${res}`);
                    })
                })


            }
        })
    }

})