$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    /************************************************************
     **                    GLOBAL SELECTORS 
     ************************************************************/
    let main = document.querySelector(".main");
    const ADD_NEW_ADDRESS_FORM = document.getElementById('form_addNewAddress');
    const UPDATE_NEW_ADDRESS_MODAL = document.getElementById('modal_editAddress');
    const UPDATE_NEW_ADDRESS_MODAL_BUTTON = document.getElementById('btnCloseUpdateModal');
    const ALL_UPDATE_ADDRESS_BUTTON = document.querySelectorAll('[name="btnEdit"]')
    const ALL_DELETE_ADDRESS_BUTTON = document.querySelectorAll('[name="btnDelete"]')




    //* ====================== Sweet Alerts Controller ======================= *//
    const sweetAlerts = (type) => {
        switch (type) {
            case 'addNewAddressSuccess':
                main.classList.remove("active");
                Swal.fire({
                    icon: 'success',
                    title: 'Added Successfully',
                    text: 'Your new address has been added',
                    timer: 3000,
                    showCancelButton: false,
                    showConfirmButton: false
                }).then(() => {
                    window.location.reload();
                })
                break;
        }
    }


    //* ====================== Address Section ======================= *//
    //:: Add new address
    ADD_NEW_ADDRESS_FORM.addEventListener('submit', (e) => {
        e.preventDefault();

        // Inputs
        const fullName = document.getElementsByName('address_fullName')[0].value;
        const phoneNum = document.getElementsByName('address_phone')[0].value;
        const city = document.getElementsByName('address_city')[0].value;
        const barangay = document.getElementsByName('address_barangay')[0].value;
        const province = document.getElementsByName('address_province')[0].value;
        const postal = document.getElementsByName('address_postal')[0].value;
        const street = document.getElementsByName('address_street')[0].value;
        const labelType = document.querySelectorAll('[name="address_label"]');

        //? Address object to be passed to Api
        const addressObj = {
            name: fullName,
            phone: phoneNum,
            barangay: barangay,
            city: city,
            street: street,
            province: province,
            postal: postal
        }

        for (const label of labelType) {
            if (label.classList.contains('label-active')) {
                addressObj.type = label.textContent;
            }
        }


        //? Api
        fetch('/customercenter/settings/addAddress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                uid: trimmedUID,
                addressData: addressObj
            })
        }).then(res => {
            if (res.ok) return sweetAlerts('addNewAddressSuccess');
        }).catch(err => {
            console.error(`Fetch API Error: ${err.message}`)
        })
    })

    //:: Update address
    UPDATE_NEW_ADDRESS_MODAL_BUTTON.addEventListener('click', () => {
        main.classList.remove("active-edit");
    })

    const generateUpdateModal = (addressData) => {
        const UPDATE_MODAL_TEMPLATE = `
            <div class="modal-address-wrap" id='partialDiv'>
                <div class="field-flex">
                    <label class="custom-field">
                        <input type="text" name="address_fullName" value="${addressData[0].name}" required>
                        <span class="placeholder">Full Name</span>
                    </label>

                    <label class="custom-field">
                        <input type="text" name="address_phone" value="${addressData[0].phone}" required>
                        <span class="placeholder">Phone Number</span>
                    </label>
                </div>
                <div class="field-flex">
                    <label class="custom-field">
                        <input type="text" name="address_city" value="${addressData[0].city}" required>
                        <span class="placeholder">City</span>
                    </label>

                    <label class="custom-field">
                        <input type="text" name="address_province" value="${addressData[0].province}" required>
                        <span class="placeholder">Province</span>
                    </label>
                </div>
                <div class="field-grid">
                    <label class="custom-field">
                        <input type="text" name="address_barangay" value="${addressData[0].barangay}" required>
                        <span class="placeholder">Barangay</span>
                    </label>
                    <label class="custom-field">
                        <input type="text" name="address_postal" value="${addressData[0].postal}" required>
                        <span class="placeholder">Postal Code</span>
                    </label>
                    <label class="custom-field">
                        <input type="text" name="address_street" value="${addressData[0].street}" required>
                        <span class="placeholder">Street Name, Building, House No.</span>
                    </label>
                </div>
                <div class="field-label">
                    <p>Label As:</p>
                    <div id="label-types">
                        <label name="address_label" class="label-type ${addressData[0].type === 'Home' ? 'label-active' : ''}">Home</label>
                        <label name="address_label" class="label-type ${addressData[0].type === 'Work' ? 'label-active' : ''}">Work</label>
                    </div>
                </div>
            </div>
        `;

        UPDATE_NEW_ADDRESS_MODAL.insertAdjacentHTML('beforeend', UPDATE_MODAL_TEMPLATE)
    }

    for (const btnIndex of ALL_UPDATE_ADDRESS_BUTTON) {
        btnIndex.addEventListener('click', () => {
            const addressID = btnIndex.dataset.addressId;

            $('#partialDiv').remove();
            $('#loader').css('display', 'block');

            fetch('/customercenter/settings/getAddress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    uid: trimmedUID,
                    id: addressID
                })
            }).then(res => {
                if (res.ok) return res.json();
            }).then(data => {
                generateUpdateModal(data);
                $('#loader').css('display', 'none');
            }).catch(err => {
                console.error(`Fetch API Error: ${err.message}`)
            })
        })
    }
})