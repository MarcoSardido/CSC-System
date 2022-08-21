import {
    getTotalProducts,
    displayAllProducts,
    getSingleProduct,
    deleteSingleProduct
} from './Api/displayProductsApi.js'

$(document).ready(() => {
    let itemLoaded = false;

    //? User ID
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();


    //* Get total products quantity 
    getTotalProducts(trimmedUID).then(res => {
        $('.totalProd').text(`Total ${res}`)
    });

    //* Start of Display all products 
    const addItemsToRow = (data) => {
        const parentComponent = document.querySelector('.products-body');
        let computed, totalRow;

        // Sort item name
        data.sort((a, b) => {
            let fa = a.itemName.toLowerCase(),
                fb = b.itemName.toLowerCase();

            if (fa < fb) {
                return -1;
            }
            if (fa > fb) {
                return 1;
            }
            return 0;
        });

        if (data.length % 4 === 0) {
            computed = data.length / 4;
            totalRow = computed.toString();

        } else {
            computed = (data.length / 4) + 1;
            totalRow = computed.toString().split('.')[0];
        }

        for (let rowIndex = 0; rowIndex < Number(totalRow); rowIndex++) {
            const el = document.createElement('div');
            el.classList.add('prod-row')
            parentComponent.appendChild(el);

            let prodContainer = '';


            for (let itemIndex = 0; itemIndex < data.length; itemIndex++) {

                if (itemIndex === 4) {
                    data.splice(0, 4);
                    itemIndex = 0;
                    break;
                }

                prodContainer += `
                    <div class="prod-cont">
                        <div class="img-options">
                            <div class="dropdown item-dropdown">
                                <button class="btnItemMenu" type="button" id="dropdownMenuButton" data-toggle="dropdown"
                                    aria-expanded="false">
                                    <ion-icon name="ellipsis-horizontal"></ion-icon>
                                </button>
                                <div class="dropdown-menu item-menu" aria-labelledby="dropdownMenuButton">
                                    <p class="dropdown-item view-item" data-item-id="${data[itemIndex].itemID}" data-toggle="modal" data-target="#viewItemModal"> More Info</p>
                                    <div class="dropdown-divider"></div>
                                    <p class="dropdown-item delete-item" data-item-id="${data[itemIndex].itemID}" data-toggle="modal" data-target="#deleteItemModal">Delete</p>
                                </div>
                            </div>
                        </div>
                        <div class="prod-img">
                                <img src="data:${data[itemIndex].itemImages[0].type};base64,${data[itemIndex].itemImages[0].data}" alt="${data[itemIndex].itemName}">
                        </div>
                        <div class="prod-desc">
                            <p class="itemName">
                                ${data[itemIndex].itemName}
                            </p>
                            <div class="desc-comb">
                                <p class="itemVariety">
                                    ${data[itemIndex].itemVariant.length} Varieties
                                </p>
                                <p class="itemPrice">
                                    ₱${data[itemIndex].itemPrice}
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            }
            el.insertAdjacentHTML('beforeend', prodContainer)
        }
        $('.noItems').remove();
        $('#loading-container').remove();
    }

    displayAllProducts(trimmedUID).then(res => {
        if (res.length === 0) {
            document.querySelector('.noItems').style.display = 'block'
            return $('#loading-container').remove();
        }
            
        addItemsToRow(res)
        itemLoaded = true;
        showViewItemModal()
        showDeleteItemModal();
    });

    //* End of Display all products 

    //* Start of View single product
    const viewItem = (data) => {
        const modalTitle = document.querySelector('.item-title');
        const titleNode = document.createTextNode(data.prodName);
        modalTitle.appendChild(titleNode);
    }

    const showViewItemModal = () => {
        if (itemLoaded) {
            const itemModal = document.querySelectorAll('.view-item');
            for (const item of itemModal) {
                item.addEventListener('click', () => {
                    const itemID = item.dataset.itemId;
                    getSingleProduct(trimmedUID, itemID).then(res => viewItem(res))
                })
            } 
        }
    }
    //* End of View single product


    //* Start of Delete single product
    const showDeleteItemModal = () => {
        if (itemLoaded) {
            const itemModal = document.querySelectorAll('.delete-item');
            for (const item of itemModal) {
                item.addEventListener('click', () => {
                    const itemID = item.dataset.itemId;

                    const confirmDelete = document.getElementById('btnDeleteItem');
                    const displayAlert = document.querySelector('.alert');
                    confirmDelete.addEventListener('click', () => {
                        deleteSingleProduct(trimmedUID, itemID).then(() => {
                            displayAlert.style.display = 'block';
                            
                            setTimeout(() => {
                                window.location.reload();
                            }, 3000);
                            
                        })
                    })
                })
            } 
        }
    }
    //* End of Delete single product
});