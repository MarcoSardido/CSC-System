$(document).ready(() => {

    const editContainer = document.querySelector('.edit-form');
    const updateContainer = document.querySelector('.submit-form');
    const btnEditProfile = document.getElementById('btnEditProfile');
    btnEditProfile.addEventListener('click', () => {

        const enableInput = document.querySelectorAll('.form-input')
        for (const inputIndex of enableInput) {
            inputIndex.removeAttribute('disabled');
        }
        editContainer.style.display = 'none';
        updateContainer.style.display = 'block';
    })

    const btnUpdateData = document.getElementById('btnUpdateData');
    btnUpdateData.addEventListener('click', () => {
        setTimeout(() => {
            const enableInput = document.querySelectorAll('.form-input')
            for (const inputIndex of enableInput) {
                inputIndex.setAttribute('disabled', '');
            }
            window.location.reload();
        }, 2000)
        
    })


    const btnCancelUpdate = document.getElementById('btnCancelUpdate');
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
    btnChangePhoto.addEventListener('click', () => {
        btnChangePhoto.style.display = 'none';
        btnClosePhoto.style.display = 'block';
        currentPhoto.style.display = 'none';
        fileUpload.style.display = 'block';
    })


    btnClosePhoto.addEventListener('click', () => {
        console.log('click close')
        btnChangePhoto.style.display = 'block';
        btnClosePhoto.style.display = 'none';
        currentPhoto.style.display = 'block';
        fileUpload.style.display = 'none';
    })

})