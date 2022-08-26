import { getAllCustomerAddress, addNewAddress, calcItems, stripePaymentHandler, codPaymentHandler } from './Api/checkOutModalData.js'
import { selectedCartItems } from './selectedProduct.js';

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    const urlOrigin = window.location.pathname;
    const getRoomId = urlOrigin.split('/');
    const liveRoomID = getRoomId[getRoomId.length - 1];

    const paymentObj = selectedCartItems;

    const loadCustomerAddress = () => {
        getAllCustomerAddress(trimmedUID).then(result => {
            // -----------------------------------------------------------------------------------
            //* -------------------------------- LIST ALL ADDRESS --------------------------------
            // -----------------------------------------------------------------------------------
            const dynamicAddressContainer = document.getElementById('dynamicAddress');

            const loopOtherAddress = () => {
                let OTHER_ADDRESS_TEMPLATE = ``;

                for (const [addressIndex, addressValue] of Object.entries(result)) {
                    OTHER_ADDRESS_TEMPLATE += `
                        <div class="other-address ${addressIndex === '0' ? 'selected-address' : ''}">
                            <div class="tag">${addressValue.addressType}</div>
                            <div class="address">
                                <p>${addressValue.HouseOrUnitNo}, ${addressValue.Barangay}, ${addressValue.City}, ${addressValue.Province}.</p>
                                <p>${addressValue.zipCode}</p>
                            </div>
                        </div>
                    `;
                }

                return OTHER_ADDRESS_TEMPLATE;
            }

            const ADDRESS_TEMPLATE = `
                <label>shipping address</label>
                <div class="selected">
                    <div class="main" id="dynamicChangeAddress">
                        <div class="tag">${result[0].addressType}</div>
                        <div class="address">
                            <p id="addressValue">${result[0].HouseOrUnitNo}, ${result[0].Barangay}, ${result[0].City}, ${result[0].Province}.</p>
                            <p id="postalValue">${result[0].zipCode}</p>
                        </div>
                    </div>
                    <button class="toggle-address" data-toggle="collapse" data-target="#collapseAddress"
                        aria-expanded="false" aria-controls="collapseAddress">
                        Choose other address
                    </button>
                </div>
                <div class="collapse" id="collapseAddress">
                    <div class="address-list">
                        <div class="add-address">
                            <button class="add-another-address" id="btnAddAddress" data-toggle="modal" data-target="#addNewAddressModal">
                                <div class="icon">
                                    <ion-icon name="add-outline"></ion-icon>
                                </div>
                                <span>Add another address</span>
                            </button>
                        </div>
                        <div class="list" id="dynamicList">${result.length > 1 ? loopOtherAddress() : ''}</div>
                    </div>
                </div>
            `;

            dynamicAddressContainer.insertAdjacentHTML('beforeend', ADDRESS_TEMPLATE)


            // -----------------------------------------------------------------------------------
            //* -------------------------------- SWITCH ADDRESS ----------------------------------
            // -----------------------------------------------------------------------------------
            const getAllOtherAddresses = document.querySelectorAll('.other-address');
            const changeAddress = document.getElementById('dynamicChangeAddress');

            for (const otherAddressIndex of getAllOtherAddresses) {
                otherAddressIndex.addEventListener('click', () => {
                    const address = otherAddressIndex.children[1].firstElementChild;
                    const postal = otherAddressIndex.children[1].lastElementChild;

                    address.setAttribute('id', 'addressValue')
                    postal.setAttribute('id', 'postalValue')

                    const convertedEl = otherAddressIndex.innerHTML;

                    getAllOtherAddresses.forEach(removeClass => removeClass.classList.remove('selected-address'))
                    otherAddressIndex.classList.add('selected-address');


                    $('#dynamicChangeAddress').empty();
                    changeAddress.insertAdjacentHTML('beforeend', convertedEl)
                })
            }

        });
    }

    // Add new address
    const newAddressFunc = () => {
        const homeValue = document.getElementById('newAddressHouse');
        const provinceValue = document.getElementById('newAddressProvince');
        const cityValue = document.getElementById('newAddressCity');
        const barangayValue = document.getElementById('newAddressBarangay');
        const postalValue = document.getElementById('newAddressPostal');

        const btnSaveNewAddress = document.getElementById('btnSaveNewAddress');
        const getAllAddressType = document.querySelectorAll('.address-type');

        let getAddressType;
        for (const addressTypeIndex of getAllAddressType) {
            addressTypeIndex.addEventListener('click', () => {
                getAllAddressType.forEach(removeClass => removeClass.classList.remove('selected-type'))
                addressTypeIndex.classList.add('selected-type');
                getAddressType = addressTypeIndex.textContent;
            })
        }


        btnSaveNewAddress.addEventListener('click', () => {
            const newAddressObj = {
                home: homeValue.value,
                province: provinceValue.value,
                city: cityValue.value,
                barangay: barangayValue.value,
                postal: postalValue.value,
                type: getAddressType
            }

            addNewAddress(trimmedUID, newAddressObj).then(result => {
                $('#dynamicAddress').empty();
                loadCustomerAddress();
                $('#addNewAddressModal').modal('hide');
            })
        })
    }

    const getPaymentMethod = () => {
        const methods = document.querySelectorAll('.method');

        for (const methodIndex of methods) {
            methodIndex.addEventListener('click', () => {
                methods.forEach(removeClass => removeClass.classList.remove('selected'))
                methodIndex.classList.add('selected')
                paymentObj.paymentMethod = methodIndex.id;
            })
        }

    }

    document.getElementById('btnConfirmPay').addEventListener('click', () => {
        $('#cartPaymentModal').css('cursor', 'wait');

        const selectedAddress = document.getElementById('addressValue').textContent;
        const selectedPostal = document.getElementById('postalValue').textContent;
        const billerName = document.getElementById('inputBillerName').value;
        const billerPhone = document.getElementById('inputBillerPhone').value;
        const billerEmail = document.getElementById('inputBillerEmail').value;

        paymentObj.name = billerName;
        paymentObj.phone = billerPhone;
        paymentObj.email = billerEmail;
        paymentObj.address = `${selectedAddress} ${selectedPostal}`;

        calcItems(trimmedUID, liveRoomID, paymentObj.itemsArray)
            .then(result => {
                const cartItems = result;

                // Method: Credit Card
                if (paymentObj.paymentMethod === 'STRIPE') {
                    const method = 'Credit Card';
                    const firstName = paymentObj.name.split(' ')[0];
                    const lastName = paymentObj.name.split(' ')[paymentObj.name.split(' ').length - 1];

                    const user = {
                        uid: trimmedUID,
                        fName: firstName,
                        lName: lastName,
                        email: paymentObj.email,
                        contactNo: paymentObj.phone,
                        address: paymentObj.address
                    };

                    stripePaymentHandler(trimmedUID, user, cartItems, method);
                } else {
                    // Method: Cash On Delivery
                    const codObjData = {
                        modeOfPayment: paymentObj.paymentMethod,
                        orderAddress: paymentObj.address,
                        
                    }
                    codPaymentHandler(trimmedUID, liveRoomID, codObjData, cartItems).then(() => {
                        window.location.reload();
                        // $('#cartPaymentModal').modal('hide');
                        // $('#cartPaymentModal').css('cursor', 'auto');
                    });
                }
            })
    })


    getPaymentMethod();
    loadCustomerAddress();
    newAddressFunc();
})