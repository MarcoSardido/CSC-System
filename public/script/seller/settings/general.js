import { changeProfilePhoto } from './Api/updateProfile.js';
import { uploadDocuments } from './Api/verifyDocuments.js';

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();


    //! ======================================= Account ============================================= !//

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



    //! =================================== Verify Documents ================================= !//

    const citizenshipHelpTool = document.getElementById('dynamicHelpToolCitizenship');
    const personalHelpTool = document.getElementById('dynamicHelpToolPersonal');
    const businessHelpTool = document.getElementById('dynamicHelpToolBusiness');

    const citizenshipHelpText = document.getElementById('dynamicHelpTextCitizenship');
    const personalHelpText = document.getElementById('dynamicHelpTextPersonal');
    const businessHelpText = document.getElementById('dynamicHelpTextBusiness');


    //? Show help text if hovered
    citizenshipHelpTool.addEventListener('mouseenter', () => {
        citizenshipHelpText.style.display = 'block';
    })
    citizenshipHelpTool.addEventListener('mouseleave', () => {
        citizenshipHelpText.style.display = 'none';
    })

    personalHelpTool.addEventListener('mouseenter', () => {
        personalHelpText.style.display = 'block';
    })
    personalHelpTool.addEventListener('mouseleave', () => {
        personalHelpText.style.display = 'none';
    })

    businessHelpTool.addEventListener('mouseenter', () => {
        businessHelpText.style.display = 'block';
    })
    businessHelpTool.addEventListener('mouseleave', () => {
        businessHelpText.style.display = 'none';
    })


    
    //* ================================ Citizenship ID ======================================= *//
    const btnEditCit = document.getElementById('btnEditCitizen')
    const btnGroupCit = document.getElementById('btnGroupCitizen')
    const btnCancelUploadCit = document.getElementById('btnCancelCitizen');
    const btnUploadCit = document.getElementById('btnUploadCitizen');
    const displayCitImgContainer = document.getElementById('displayImgCitizen');
    const uploadCitImgContainer = document.getElementById('UploadImgCitizen');
    const inputCitizen = document.getElementById('fileUploadCitizen');
    const uploadCitizenID = document.getElementsByName('filepondCitizen');


    // Display
    btnCancelUploadCit.addEventListener('click', () => {
        btnGroupCit.style.display = 'none';
        btnEditCit.style.display = 'block';
        displayCitImgContainer.style.display = 'block';
        uploadCitImgContainer.style.display = 'none';
    })

    // Edit
    btnEditCit.addEventListener('click', () => {
        btnGroupCit.style.display = 'block';
        btnEditCit.style.display = 'none';
        displayCitImgContainer.style.display = 'none';
        uploadCitImgContainer.style.display = 'block';

        btnUploadCit.classList.add('disabled');
        btnUploadCit.setAttribute('disabled', true)
    })

    // Upload
    inputCitizen.addEventListener('change', () => {
        btnUploadCit.classList.remove('disabled');
        btnUploadCit.removeAttribute('disabled', '')

        btnUploadCit.addEventListener('click', () => {
            let parsedImg;
            const acceptedImg = {}

            parsedImg = JSON.parse(uploadCitizenID[0].value);

            if (!imageMimeTypes.includes(parsedImg.type)) return alert('Your profile image type is not supported. Please select image with type (.jpg, .jpeg, .png)');

            Object.assign(acceptedImg, {
                data: parsedImg.data,
                type: parsedImg.type
            })

            uploadDocuments(trimmedUID, acceptedImg, 'citizen').then((status) => {
                if (status.type === 'error') {
                    let trimIndex = status.message.lastIndexOf('"') + 1;
                    let alertMessage = status.message.slice(trimIndex);

                    return alert(`File Upload Error: Selected Image ${alertMessage} Please select a different image.`);
                }

                window.location.reload();
            })
        })
    })


    //* ================================ Personal ID ======================================= *//
    const btnEditPersonal = document.getElementById('btnEditPersonal')
    const btnGroupPersonal = document.getElementById('btnGroupPersonal')
    const btnCancelUploadPersonal = document.getElementById('btnCancelPersonal');
    const btnUploadPersonal = document.getElementById('btnUploadPersonal');
    const displayPersonalImgContainer = document.getElementById('displayImgPersonal');
    const uploadPersonalImgContainer = document.getElementById('UploadImgPersonal');
    const inputPersonal = document.getElementById('fileUploadPersonal');
    const uploadPersonalID = document.getElementsByName('filepondPersonal');


    // Display
    btnCancelUploadPersonal.addEventListener('click', () => {
        btnGroupPersonal.style.display = 'none';
        btnEditPersonal.style.display = 'block';
        displayPersonalImgContainer.style.display = 'block';
        uploadPersonalImgContainer.style.display = 'none';
    })

    // Edit
    btnEditPersonal.addEventListener('click', () => {
        btnGroupPersonal.style.display = 'block';
        btnEditPersonal.style.display = 'none';
        displayPersonalImgContainer.style.display = 'none';
        uploadPersonalImgContainer.style.display = 'block';
    })

    // Upload
    inputPersonal.addEventListener('change', () => {
        btnUploadPersonal.classList.remove('disabled');
        btnUploadPersonal.removeAttribute('disabled', '')

        btnUploadPersonal.addEventListener('click', () => {
            let parsedImg;
            const acceptedImg = {}

            parsedImg = JSON.parse(uploadPersonalID[0].value);

            if (!imageMimeTypes.includes(parsedImg.type)) return alert('Your profile image type is not supported. Please select image with type (.jpg, .jpeg, .png)');

            Object.assign(acceptedImg, {
                data: parsedImg.data,
                type: parsedImg.type
            })

            uploadDocuments(trimmedUID, acceptedImg, 'personal').then((status) => {
                if (status.type === 'error') {
                    let trimIndex = status.message.lastIndexOf('"') + 1;
                    let alertMessage = status.message.slice(trimIndex);

                    return alert(`File Upload Error: Selected Image ${alertMessage} Please select a different image.`);
                }

                window.location.reload();
            });
        })
    })



    //* ================================ Business License ======================================= *//
    const btnEditBusiness = document.getElementById('btnEditBusiness')
    const btnGroupBusiness = document.getElementById('btnGroupBusiness')
    const btnCancelUploadBusiness = document.getElementById('btnCancelBusiness');
    const btnUploadBusiness = document.getElementById('btnUploadBusiness');
    const displayBusinessImgContainer = document.getElementById('displayImgBusiness');
    const uploadBusinessImgContainer = document.getElementById('UploadImgBusiness');
    const inputBusiness = document.getElementById('fileUploadBusiness');
    const uploadBusinessID = document.getElementsByName('filepondBusiness');


    // Display
    btnCancelUploadBusiness.addEventListener('click', () => {
        btnGroupBusiness.style.display = 'none';
        btnEditBusiness.style.display = 'block';
        displayBusinessImgContainer.style.display = 'block';
        uploadBusinessImgContainer.style.display = 'none';
    })

    // Edit
    btnEditBusiness.addEventListener('click', () => {
        btnGroupBusiness.style.display = 'block';
        btnEditBusiness.style.display = 'none';
        displayBusinessImgContainer.style.display = 'none';
        uploadBusinessImgContainer.style.display = 'block';
    })

    // Upload
    inputBusiness.addEventListener('change', () => {
        btnUploadBusiness.classList.remove('disabled');
        btnUploadBusiness.removeAttribute('disabled', '')

        btnUploadBusiness.addEventListener('click', () => {
            let parsedImg;
            const acceptedImg = {}

            parsedImg = JSON.parse(uploadBusinessID[0].value);

            if (!imageMimeTypes.includes(parsedImg.type)) return alert('Your profile image type is not supported. Please select image with type (.jpg, .jpeg, .png)');

            Object.assign(acceptedImg, {
                data: parsedImg.data,
                type: parsedImg.type
            })

            uploadDocuments(trimmedUID, acceptedImg, 'business').then((status) => {
                if (status.type === 'error') {
                    let trimIndex = status.message.lastIndexOf('"') + 1;
                    let alertMessage = status.message.slice(trimIndex);

                    return alert(`File Upload Error: Selected Image ${alertMessage} Please select a different image.`);
                }

                window.location.reload();
            });
        })
    })


})