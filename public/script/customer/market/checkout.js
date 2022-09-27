import { getAllCustomerAddress, addNewAddress, stripePaymentHandler, codPaymentHandler } from '../live/Api/checkOutModalData.js'
import { checkoutArray } from './displayProducts.js';

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    const urlOrigin = window.location.pathname;
    const getRoomId = urlOrigin.split('/');
    const liveRoomID = getRoomId[getRoomId.length - 1];

    const urlQuery = window.location.href.split('?')[1];
    const isAnonymousBuyer = urlQuery.split('=')[1];

    //! Main Object
    const checkoutObject = {};

    //* ----------------------------------------------------------------------------------------
    //  ---------------------------------- Global Selectors ------------------------------------ 
    //* ----------------------------------------------------------------------------------------
    const billerName = document.getElementById('inputBillerName');
    const billerPhone = document.getElementById('inputBillerPhone');
    const billerEmail = document.getElementById('inputBillerEmail');

    const btnConfirmPay = document.getElementById('btnConfirmPay');



    const loadCustomerAddress = () => {
        getAllCustomerAddress(trimmedUID).then(result => {
            const dynamicAddressContainer = document.getElementById('dynamicAddress');

            //* List all address
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
                ${result.length > 0 ? 
                `
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
                ` : 
                `
                    <div class="selected">
                        <button class="add-another-address no-address" id="btnAddAddress" data-toggle="modal" data-target="#addNewAddressModal">
                            <div class="icon">
                                <ion-icon name="add-outline"></ion-icon>
                            </div>
                            <span>Add address</span>
                        </button>
                    </div>
                `}
                
            `;

            dynamicAddressContainer.insertAdjacentHTML('beforeend', ADDRESS_TEMPLATE)


            //* Switch address 
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

    const createNewAddress = () => {
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
                methodIndex.classList.add('selected');

                checkoutObject.paymentMethod = methodIndex.id;
            })
        }
    }

    const calculateItems = (itemArray, payment) => {
        const items = [];

        for (const itemIndex of itemArray) {
            items.push({
                id: `itemID_${itemIndex.id}`,
                image: payment === 'STRIPE' ? '' : itemIndex.itemImg,
                productID: itemIndex.prodID,
                name: itemIndex.itemName,
                color: itemIndex.itemColor,
                description: itemIndex.itemDesc,
                quantity: itemIndex.itemQty,
                priceInCents: itemIndex.itemPrice,
                subTotal: itemIndex.itemTotal,
                size: itemIndex.itemSize
            })
        }

        return items;
    }



    btnConfirmPay.addEventListener('click', () => {
        $('#cartPaymentModal').css('cursor', 'wait');

        const selectedAddress = document.getElementById('addressValue').textContent;
        const selectedPostal = document.getElementById('postalValue').textContent;

        // items in cart
        checkoutObject.items = checkoutArray;

        // user info
        checkoutObject.name = billerName.value;
        checkoutObject.phone = billerPhone.value;
        checkoutObject.email = billerEmail.value;
        checkoutObject.address = `${selectedAddress} ${selectedPostal}`;

        // Formatted items
        const checkoutItems = calculateItems(checkoutObject.items, checkoutObject.paymentMethod);

        //* Checkout 
        //* :: Method -> Credit Card
        if (checkoutObject.paymentMethod === 'STRIPE') {
            const method = 'Credit Card';
            const firstName = checkoutObject.name.split(' ')[0];
            const lastName = checkoutObject.name.split(' ')[checkoutObject.name.split(' ').length - 1];

            const user = {
                uid: trimmedUID,
                fName: firstName,
                lName: lastName,
                email: checkoutObject.email,
                contactNo: checkoutObject.phone,
                address: checkoutObject.address
            };

            stripePaymentHandler(trimmedUID, user, checkoutItems, method, isAnonymousBuyer);
        } else {
            //* :: Method -> Cash On Delivery
            const codObjData = {
                modeOfPayment: checkoutObject.paymentMethod,
                orderAddress: checkoutObject.address,
            }
            codPaymentHandler(trimmedUID, liveRoomID, codObjData, checkoutItems, isAnonymousBuyer).then(() => {
                window.location.reload();
            });
        }
    })

    loadCustomerAddress();
    createNewAddress();
    getPaymentMethod();

})