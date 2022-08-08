import { getAllCustomerAddress } from './Api/checkOutModalData.js'
import { selectedCartItems } from './selectedProduct.js';

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const liveSessionID = urlParams.get('session')

    const paymentObj = selectedCartItems;

    const loadCustomerAddress = () => {
        getAllCustomerAddress(trimmedUID).then(result => {
            console.log(result)

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
                        <div class="list">${result.length > 1 ? loopOtherAddress() : ''}</div>
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
        const selectedAddress = document.getElementById('addressValue').textContent;
        const selectedPostal = document.getElementById('postalValue').textContent;
        const billerName = document.getElementById('inputBillerName').value;
        const billerPhone = document.getElementById('inputBillerPhone').value;
        const billerEmail = document.getElementById('inputBillerEmail').value;

        paymentObj.name = billerName;
        paymentObj.phone = billerPhone;
        paymentObj.email = billerEmail;
        paymentObj.address = `${selectedAddress} ${selectedPostal}`;

        console.log(paymentObj)
    })


    getPaymentMethod();
    loadCustomerAddress();
})