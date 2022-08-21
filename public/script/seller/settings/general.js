import { changeProfilePhoto, updateProfileInfo } from './Api/updateProfile.js';

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    const editContainer = document.querySelector('.edit-form');
    const updateContainer = document.querySelector('.submit-form');
    const btnEditProfile = document.getElementById('btnEditProfile');
    const btnUpdateData = document.getElementById('btnUpdateData');
    const btnCancelUpdate = document.getElementById('btnCancelUpdate');

    btnEditProfile.addEventListener('click', () => {
        const enableInput = document.querySelectorAll('.form-input')
        for (const inputIndex of enableInput) {
            inputIndex.removeAttribute('disabled');
        }
        editContainer.style.display = 'none';
        updateContainer.style.display = 'block';
    })


    btnUpdateData.addEventListener('click', () => {
        setTimeout(() => {
            const enableInput = document.querySelectorAll('.form-input')
            for (const inputIndex of enableInput) {
                inputIndex.setAttribute('disabled', '');
            }
            // updateProfileInfo(trimmedUID).then(() => {
            //     window.location.reload();
            // })
            window.location.reload();
            
        }, 2000)

    })


    btnCancelUpdate.addEventListener('click', () => {
        const enableInput = document.querySelectorAll('.form-input')
        for (const inputIndex of enableInput) {
            inputIndex.setAttribute('disabled', '');
        }

        editContainer.style.display = 'block';
        updateContainer.style.display = 'none';
    })


    const fileUpload = document.querySelector('.filUpload');
    const currentPhoto = document.querySelector('.display-photo');
    const btnChangePhoto = document.querySelector('#icon-upload');
    const btnClosePhoto = document.querySelector('#icon-close');
    const btnApplyPhoto = document.querySelector('.btn-changePhoto');
    btnChangePhoto.addEventListener('click', () => {
        btnChangePhoto.style.display = 'none';
        btnClosePhoto.style.display = 'block';
        currentPhoto.style.display = 'none';
        fileUpload.style.display = 'block';
    })


    btnClosePhoto.addEventListener('click', () => {
        btnChangePhoto.style.display = 'block';
        btnClosePhoto.style.display = 'none';
        currentPhoto.style.display = 'block';
        fileUpload.style.display = 'none';
        btnApplyPhoto.style.display = 'none';
    })

    const inputPhoto = document.getElementById('inputPhoto');
    const profileImage = document.getElementsByName('filepondProfile');
    const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/PNG'];

    inputPhoto.addEventListener('change', () => {
        btnApplyPhoto.style.display = 'block';

        btnApplyPhoto.addEventListener('click', () => {
            let parsedImg;
            const acceptedImg = {}

            parsedImg = JSON.parse(profileImage[0].value);

            if (!imageMimeTypes.includes(parsedImg.type)) return alert('Your profile image type is not supported. Please select image with type (.jpg, .jpeg, .png)');

            Object.assign(acceptedImg, {
                data: parsedImg.data,
                type: parsedImg.type
            })

            changeProfilePhoto(trimmedUID, acceptedImg).then(() => {
                window.location.reload();
            });

        })
    })
})