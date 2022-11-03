import { firebase } from '../../firebaseConfig.js';
import { getFirestore, doc, collection, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase)

import { getAllCustomerAddress, addNewAddress, calcItems, stripePaymentHandler, codPaymentHandler } from './Api/checkOutModalData.js'
import { selectedCartItems } from './selectedProduct.js';

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    const urlOrigin = window.location.pathname;
    const getRoomId = urlOrigin.split('/');
    const liveRoomID = getRoomId[getRoomId.length - 1];

    //! Main Object
    const checkoutObject = {};

    const userObj = {};

    //* ================================== Firebase Functions =================================== *// 
    const customerBuy = async (roomID) => {
        try {
            //* COLLECTION: LiveSession
            const liveDocRef = doc(db, `LiveSession/sessionID_${roomID}`);
            await setDoc(liveDocRef, {
                customer: userObj.displayName
            }, { merge: true }).then(() => {
                setTimeout(() => {
                    setDoc(liveDocRef, {
                        customer: ''
                    }, { merge: true }).catch(err => {
                        console.error(`Firestore Error -> @customerBuy: ${err.message}`)
                    });
                }, 3000)
            }).catch(err => {
                console.error(`Firestore Error -> @customerBuy: ${err.message}`)
            })
        } catch (error) {
            console.error(`Firestore Error -> @customerBuy: ${error.message}`)
        }
    }

    const getUserData = async (uid) => {
        //* CUSTOMER COLLECTION
        const customerDocRef = doc(db, `Customers/${uid}`);
        const customerDocument = await getDoc(customerDocRef);

        userObj.displayName = customerDocument.data().displayName;
    }



    //* ================================== Global Selectors =================================== *// 
    const billerName = document.getElementById('inputBillerName');
    const billerPhone = document.getElementById('inputBillerPhone');
    const billerEmail = document.getElementById('inputBillerEmail');
    const btnConfirmPay = document.getElementById('btnConfirmPay');



    const loadCustomerAddress = () => {
        getAllCustomerAddress(trimmedUID).then(result => {
            const billerName = document.getElementById('inputBillerName');
            const billerPhone = document.getElementById('inputBillerPhone');
            const dynamicAddressContainer = document.getElementById('dynamicAddress');

            //* List all address
            const loopOtherAddress = () => {
                let OTHER_ADDRESS_TEMPLATE = ``;

                for (const [addressIndex, addressValue] of Object.entries(result)) {
                    OTHER_ADDRESS_TEMPLATE += `
                        <div class="other-address ${addressIndex === '0' ? 'selected-address' : ''}">
                            <div class="tag">${addressValue.type}</div>
                            <div class="address">
                                <p hidden>${addressValue.name}</p>
                                <p hidden>${addressValue.phone}</p>
                                <p>${addressValue.street}, ${addressValue.barangay}, ${addressValue.city}, ${addressValue.province}.</p>
                                <p>${addressValue.postal}</p>
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
                            <div class="tag">${result[0].type}</div>
                            <div class="address">
                                <p id="otherAddressName" hidden>${result[0].name}</p>
                                <p id="otherAddressPhone" hidden>${result[0].phone}</p>
                                <p id="addressValue">${result[0].street}, ${result[0].barangay}, ${result[0].city}, ${result[0].province}.</p>
                                <p id="postalValue">${result[0].postal}</p>
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


            billerName.value = $('#otherAddressName').text();
            billerPhone.value = $('#otherAddressPhone').text();

            //* Switch address 
            const getAllOtherAddresses = document.querySelectorAll('.other-address');
            const changeAddress = document.getElementById('dynamicChangeAddress');

            for (const otherAddressIndex of getAllOtherAddresses) {
                otherAddressIndex.addEventListener('click', () => {
                    const name = otherAddressIndex.children[1].firstElementChild.textContent;
                    const phone = otherAddressIndex.children[1].children[1].textContent;
                    const address = otherAddressIndex.children[1].children[2];
                    const postal = otherAddressIndex.children[1].lastElementChild;

                    billerName.value = name;
                    billerPhone.value = phone;

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
        const nameValue = document.getElementById('newAddressName');
        const phoneValue = document.getElementById('newAddressPhone');
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
                name: nameValue.value,
                phone: phoneValue.value,
                home: homeValue.value,
                province: provinceValue.value,
                city: cityValue.value,
                barangay: barangayValue.value,
                postal: postalValue.value,
                type: getAddressType
            }

            addNewAddress(trimmedUID, newAddressObj).then(() => {
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
                checkoutObject.paymentMethod = methodIndex.id;
            })
        }

    }

    btnConfirmPay.addEventListener('click', () => {
        $('#cartPaymentModal').css('cursor', 'wait');

        const selectedAddress = document.getElementById('addressValue').textContent;
        const selectedPostal = document.getElementById('postalValue').textContent;

        // items in cart
        checkoutObject.items = selectedCartItems;

        // user info
        checkoutObject.name = billerName.value;
        checkoutObject.phone = billerPhone.value;
        checkoutObject.email = billerEmail.value;
        checkoutObject.address = `${selectedAddress} ${selectedPostal}`;

        calcItems(trimmedUID, liveRoomID, checkoutObject.items, checkoutObject.paymentMethod).then(result => {
            const cartItems = result;

            const firstName = checkoutObject.name.split(' ')[0];
            const lastName = checkoutObject.name.split(' ')[checkoutObject.name.split(' ').length - 1];

            // Method: Credit Card
            if (checkoutObject.paymentMethod === 'STRIPE') {
                const method = 'Credit Card';

                const user = {
                    uid: trimmedUID,
                    fName: firstName,
                    lName: lastName,
                    email: checkoutObject.email,
                    contactNo: checkoutObject.phone,
                    address: checkoutObject.address
                };

                stripePaymentHandler(trimmedUID, user, cartItems, method);
            } else {
                // Method: Cash On Delivery
                const codObjData = {
                    fName: firstName,
                    lName: lastName,
                    contactNo: checkoutObject.phone,
                    modeOfPayment: checkoutObject.paymentMethod,
                    orderAddress: checkoutObject.address,
                }

                codPaymentHandler(trimmedUID, liveRoomID, codObjData, cartItems).then(() => {
                    window.location.reload();
                });
            }

            customerBuy(liveRoomID);
        })
    })


    getPaymentMethod();
    loadCustomerAddress();
    createNewAddress();
    getUserData(trimmedUID);
})