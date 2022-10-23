import {
    getTotalProducts,
    displayAllProducts,
    deleteSingleProduct
} from './Api/displayProductsApi.js'

$(document).ready(() => {
    //? User ID
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();


    //* Get total products quantity 
    getTotalProducts(trimmedUID).then(res => {
        $('.totalProd').text(`Total ${res}`)
    });

    //* Start of Display all products 
    const addItemsToRow = (data) => {
        const productContainer = document.querySelector('.products-body');

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

        $('.noItems').remove();
        $('#loading-cont').remove();

        for (let dataIndex = 0; dataIndex < data.length; dataIndex++) {
            const prodContainer = `
                <div class="prod-cont">
                    <div class="img-options">
                        <div class="dropdown item-dropdown">
                            <button class="btnItemMenu" type="button" id="dropdownMenuButton" data-toggle="dropdown"aria-expanded="false">
                                <ion-icon name="ellipsis-horizontal"></ion-icon>
                            </button>
                            <div class="dropdown-menu item-menu" aria-labelledby="dropdownMenuButton">
                                <p class="dropdown-item view-item" data-item-id="${data[dataIndex].itemID}"> More Info</p>
                                <div class="dropdown-divider"></div>
                                <p class="dropdown-item delete-item" data-item-id="${data[dataIndex].itemID}" data-toggle="modal" data-target="#deleteItemModal">Delete</p>
                            </div>
                        </div>
                    </div>
                    <div class="prod-img">
                            <img src="data:${data[dataIndex].itemImages[0].type};base64,${data[dataIndex].itemImages[0].data}" alt="${data[dataIndex].itemName}">
                    </div>
                    <div class="prod-desc">
                        <p class="itemName">
                            ${data[dataIndex].itemName}
                        </p>
                        <div class="desc-comb">
                            <p class="itemVariety">
                                ${data[dataIndex].itemVariant.length} Varieties
                            </p>
                            <p class="itemPrice">
                                ₱${data[dataIndex].itemPrice}
                            </p>
                        </div>
                    </div>
                </div>
            `;

            productContainer.insertAdjacentHTML('beforeend', prodContainer)
        }
    }

    displayAllProducts(trimmedUID).then(res => {
        if (res.length === 0) {
            document.querySelector('.noItems').style.display = 'block'
            return $('#loading-cont').remove();
        }

        addItemsToRow(res)
        showViewItemModal()
        showDeleteItemModal();
    });

    //* End of Display all products 

    //* Start of View single product
    const showViewItemModal = () => {
        const itemModal = document.querySelectorAll('.view-item');
        for (const item of itemModal) {
            item.addEventListener('click', () => {
                const itemID = item.dataset.itemId;

                window.location.assign(`${window.location.href}/${itemID}`);
            })
        }
    }
    //* End of View single product


    //* Start of Delete single product
    const showDeleteItemModal = () => {
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
    //* End of Delete single product
});