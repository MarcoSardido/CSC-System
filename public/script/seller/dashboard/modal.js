import { startLiveSelling } from './Api/startLive.js'

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    const storeName = $('#store').text();
    const trimmedStoreName = storeName.trim();
    

    const previewObj = {
        eventName: '',
        eventDesc: '',
        eventStart: '',
        eventEnd: '',
        eventLogo: '',
        eventBanner: '',
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

        const allInput = document.querySelectorAll('[name="formInput"]');
        for (const [inputIndex, inputValue] of allInput.entries()) {
            const key = Object.keys(previewObj)[inputIndex];
            if (inputIndex > 3) {
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


    // Start Live Selling
    const btnStartLive = document.querySelector('.buttonCreate');
    btnStartLive.addEventListener('click', () => {
        startLiveSelling(trimmedUID, previewObj).then(res => {
            window.location.assign(`${window.location.href}/live/room/${res}`)
        })
        
    })

    
})