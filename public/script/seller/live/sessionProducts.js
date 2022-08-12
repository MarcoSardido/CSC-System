import { getAllProducts, getProduct } from './Api/getProducts.js'

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    const urlOrigin = window.location.pathname;
    const getRoomId = urlOrigin.split('/');
    const liveRoomID = getRoomId[getRoomId.length - 1];

    const productContainer = document.querySelector('.product-list');
    const displayProducts = () => {
        getAllProducts(liveRoomID).then(result => {
            let PRODUCT_ITEM = ``;

            // Loop all products
            for (const productIndex of result) {
                let totalQty = 0;

                for (const variantIndex of productIndex.variants) {
                    totalQty += Number(variantIndex.selectedQty)
                }

                PRODUCT_ITEM +=
                    `<div class="product-item" data-product-id="${productIndex.prodID}">
                        <img src="data:${productIndex.productImages[0].type};base64,${productIndex.productImages[0].data}"
                                alt="${productIndex.prodName}">
                        <div class="item-detail">
                            <p class="item-name">${productIndex.prodName}</p>
                            <p class="varieties">Quantity: ${totalQty}</p>
                        </div>
                    </div>`
            }

            productContainer.insertAdjacentHTML('beforeend', PRODUCT_ITEM)
        }).then(() => {
            getSingleProduct();
        })
    }

    const getSingleProduct = () => {
        const productItems = document.querySelectorAll('.product-item');
        const currentProduct = document.querySelector('.product')

        for (const itemIndex of productItems) {

            itemIndex.addEventListener('click', () => {

                for (const classIndex of productItems) {
                    classIndex.className = 'product-item';
                }

                itemIndex.classList.add('selected')
                getProduct(liveRoomID, itemIndex.dataset.productId).then(result => {

                    const getVariants = () => {
                        let VARIANT_TEMPLATE = ``;
                        for (const itemIndex of result.variants) {
                            VARIANT_TEMPLATE += `<p class="size">${itemIndex.selectedSize} - ${itemIndex.selectedQty}Pcs</p>`
                        }

                        return VARIANT_TEMPLATE;
                    }

                    const CURRENT_ITEM_TEMPLATE =
                        `<div class="current">
                            <img src="data:${result.productImages[0].type};base64,${result.productImages[0].data}"
                                alt="${result.prodName}">
                            <div class="item-details">
                                <div class="info">
                                    <p class="item-name">${result.prodName}</p>
                                    <p class="item-description">${result.prodDesc}</p>
                                    <p class="item-price">₱${result.prodPrice}</p>
                                </div>
                                <div class="variant">
                                    <p class="title">Sizes and quantity</p>
                                    <div class="data">
                                        ${getVariants()}
                                    </div>
                                </div>
                            </div>
                        </div>`;

                    if ($('.product').children().length > 0) {
                        currentProduct.removeChild(currentProduct.firstElementChild)
                    }

                    currentProduct.insertAdjacentHTML('beforeend', CURRENT_ITEM_TEMPLATE)
                })
            })
        }
    }

    displayProducts();
})