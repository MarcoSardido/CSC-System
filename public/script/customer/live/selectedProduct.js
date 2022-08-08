import { firebase } from '../../firebaseConfig.js';
import { getFirestore, doc, collection, getDoc, getDocs, setDoc, deleteDoc, updateDoc, onSnapshot, query, orderBy, limit, where } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase)

const selectedCartItems = {
    itemsArray: []
};

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const liveSessionID = urlParams.get('session')

    //! ===========================================================================================
    // ================================ Start of Firebase Function ================================
    //! ===========================================================================================

    //* Realtime product display
    const docRef = doc(db, `LiveSession/sessionID_${liveSessionID}`)
    onSnapshot(docRef, doc => {
        displaySelectedProduct(doc.data().currentProductID)
    })

    //* Add To Cart Modal
    const itemData = async (pid) => {
        try {
            const subColRef = doc(db, `LiveSession/sessionID_${liveSessionID}/sessionProducts/${pid}`);
            const subColDoc = await getDoc(subColRef);
            const prodData = subColDoc.data();

            return prodData;

        } catch (error) {
            console.log(`Firestore: Error @itemData -> ${error.message}`)
        }
    }

    const addItemToCart = async (data) => {
        const itemID = `itemID_${generateId()}`;

        try {
            const subColRef = doc(db, `LiveSession/sessionID_${liveSessionID}/sessionUsers/${trimmedUID}/LiveCart/${itemID}`)
            await setDoc(subColRef, {
                itemID: itemID,
                prodID: data.prodID,
                itemName: data.itemName,
                itemImg: data.itemImg,
                itemSize: data.itemSize,
                itemQty: data.itemQty,
                itemColor: data.itemColor,
                itemPrice: data.itemPrice,
                itemTotal: (data.itemPrice * data.itemQty)

            })
        } catch (error) {
            console.log(`Firestore: Error @addItemToCart -> ${error.message}`)
        }
    }

    const realTimeCartDisplay = async () => {
        const subColRef = collection(db, `LiveSession/sessionID_${liveSessionID}/sessionUsers/${trimmedUID}/LiveCart`)

        onSnapshot(subColRef, (snapshot) => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    const item = change.doc.data();
                    displayLiveCart(item);
                }
            });
        });
    }

    const processItem = async (pid, selectedSize, selectedQty) => {
        try {
            const subColRef = doc(db, `LiveSession/sessionID_${liveSessionID}/sessionProducts/${pid}`)
            const subColDoc = await getDoc(subColRef);

            const variantCopy = subColDoc.data().variants;
            for (const copyIndex of variantCopy) {
                if (copyIndex.selectedSize === selectedSize) {
                    const calcQty = copyIndex.selectedQty - selectedQty;
                    copyIndex.selectedQty = calcQty.toString();
                }
            }

            updateModalChanges(variantCopy)

            // await updateDoc(subColRef, {
            //     'variants': variantCopy
            // }, { merge: true }).then(() => {
            //     const docRef = doc(db, `LiveSession/sessionID_${liveSessionID}/sessionProducts/${pid}`)
            //     onSnapshot(docRef, doc => {
            //         updateModalChanges(doc.data().variants)
            //     })
            // })

            console.log('Product updated successfully: Item Added')

        } catch (error) {
            console.log(`Firestore: Error @processItem -> ${error.message}`)
        }
    }

    const removeItem = async (pid, itemID, cartItemQty, cartItemSize) => {
        try {
            // Updating product variety
            const subColRef = doc(db, `LiveSession/sessionID_${liveSessionID}/sessionProducts/${pid}`)
            const subColDoc = await getDoc(subColRef);

            const variantCopy = subColDoc.data().variants;
            for (const copyIndex of variantCopy) {
                if (copyIndex.selectedSize === cartItemSize) {
                    const calcQty = Number(copyIndex.selectedQty) + cartItemQty;
                    copyIndex.selectedQty = calcQty.toString();
                }
            }

            updateModalChanges(variantCopy)

            // await updateDoc(subColRef, {
            //     'variants': variantCopy
            // }, { merge: true })

            console.log('Product updated successfully: Item Removed')

            // Updating customer live cart
            const cartSubColRef = doc(db, `LiveSession/sessionID_${liveSessionID}/sessionUsers/${trimmedUID}/LiveCart/${itemID}`)
            await deleteDoc(cartSubColRef);

        } catch (error) {
            console.log(`Firestore: Error @removeItem -> ${error.message}`)
        }

    }

    const generateId = () => {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < 15; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }

    //! ===========================================================================================
    // ============================== End of Firebase Function ====================================
    //! ===========================================================================================

    //* Global Selectors
    const currentProduct = document.querySelector('.product');
    const cartItemContainer = document.querySelector('.product-list');

    realTimeCartDisplay()

    //? Display if cart is empty
    if (cartItemContainer.childElementCount < 1) {
        const EMPTY_CART_TEXT = `
            <div class="empty">
                <p class="emoji">😕</p>
                <p class="text">Your cart is empty</p>
            </div>
        `;
        cartItemContainer.insertAdjacentHTML('beforeend', EMPTY_CART_TEXT)
    }

    //? Display the selected item of the seller
    const displaySelectedProduct = (pid) => {
        //* Firestore
        itemData(pid).then(result => {
            const productData = result;

            const getVariants = () => {
                let VARIANT_TEMPLATE = ``;
                for (const itemIndex of productData.variants) {
                    VARIANT_TEMPLATE += `<p class="size forDataChange">${itemIndex.selectedSize} - ${itemIndex.selectedQty}Pcs</p>`
                }
                return VARIANT_TEMPLATE;
            }

            const displayColor = () => {
                let COLOR_TEMPLATE = ``;
                for (const itemIndex of productData.variants[0].selectedColors) {
                    COLOR_TEMPLATE += `<div class="color" style="background-color: ${itemIndex}"></div>`
                }
                return COLOR_TEMPLATE;
            }

            const CURRENT_ITEM_TEMPLATE =
                `<div class="current">
                    <img src="data:${productData.productImages[0].type};base64,${productData.productImages[0].data}" alt="${productData.prodName}">
                    <div class="item-details">
                        <div class="top">
                            <div class="info">
                                <p class="item-name">${productData.prodName}</p>
                                <div class="colors">${displayColor()}</div>
                            </div>
                            <div class="variant">
                                <p class="title">Sizes and quantity</p>
                                <div class="data">${getVariants()}</div>
                            </div>
                        </div>
                        <div class="bottom">
                            <button class="add-to-cart" id="btnAddToCart" data-toggle="modal" data-target="#addToCartModal" data-product-id="${productData.prodID}">
                                <div class="left">
                                    <ion-icon name="bag-add"></ion-icon>
                                    <p class="button-label">Add to cart</p>
                                </div>
                                <div class="right">
                                    <p class="item-price">₱${productData.prodPrice}</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>`;

            if ($('.product').children().length > 0) {
                currentProduct.removeChild(currentProduct.firstElementChild)
            }
            currentProduct.insertAdjacentHTML('beforeend', CURRENT_ITEM_TEMPLATE)


            initializeCartModal();
        })


    }



    //* Cart Modal
    let currentQty, selectedQty, selectedSize, selectedColor;

    const initializeCartModal = () => {
        const btnAddToCart = document.getElementById('btnAddToCart')
        btnAddToCart.addEventListener('click', () => {
            const pid = btnAddToCart.dataset.productId;

            itemData(pid).then(data => {
                const productData = data;

                //? Display product images
                generateItemImageForModal(productData)

                //? Display Product Information
                displayProductInfo(productData)

                //? Check if user has selected
                checkSelection(data);

                //? Check if qty has valid value
                checkQtyInputs(data);
            })

        })
    }


    const generateItemImageForModal = (data) => {
        const imageContainer = document.querySelector('.img-container');
        const images = data.productImages;

        if (imageContainer.hasChildNodes) $('.img-container').empty();

        const getAllImages = () => {
            let IMAGE_TEMPLATE = ``;

            for (const imageIndex of images) {
                IMAGE_TEMPLATE += `<img class="subImage" src="data:${imageIndex.type};base64,${imageIndex.data}" alt="product">`
            }
            return IMAGE_TEMPLATE;
        }

        const IMAGE_CONTAINER_TEMPLATE = `
                    <div class="main-img">
                        <img src="data:${images[0].type};base64,${images[0].data}" alt="product">
                    </div>
                    <div class="sub-img">${getAllImages()}</div>
                `;

        imageContainer.insertAdjacentHTML('beforeend', IMAGE_CONTAINER_TEMPLATE)

        //? Hover Images To Change
        imageSelection()
    }

    const imageSelection = () => {
        const subImages = document.querySelectorAll('.subImage');
        for (const imgIndex of subImages) {
            const convertElToStr = imgIndex.outerHTML;
            imgIndex.addEventListener('mouseover', () => {
                $('.main-img').empty();
                $('.main-img').append(convertElToStr);
            })
        }
    }

    const displayProductInfo = (data) => {
        const product = data;
        const elContainer = document.querySelector('.info-container');

        if (elContainer.hasChildNodes) $('.info-container').empty();

        const PRODUCT_TEMPLATE = `
            <div class="product-title">${product.prodName}</div>
            <div class="product-price">
                <span class="currency">₱</span>
                <span class="price">${product.prodPrice}</span>
            </div>
            <div class="size-selection">
                <p class="selection-label">select a size</p>
                <div class="size-container">${generateSizes(product.variants)}</div>
            </div>
            <div class="color-selection disabled">
                <p class="selection-label">select a color</p>
                <div class="color-container">
                    <button class="product-color"></button>
                    <button class="product-color"></button>
                    <button class="product-color"></button>
                    <button class="product-color"></button>
                    <button class="product-color"></button>
                </div>
            </div>
            <div class="input-group mb-3 qty-input disabled">
                <div class="input-group-prepend">
                    <span class="input-group-text">Qty</span>
                </div>
                <input type="text" class="form-control" id="inputQty" aria-label="Amount (to the nearest dollar)">
                <div class="input-group-append">
                    <span class="input-group-text qty-count">/ ∞</span>
                </div>
            </div>
            <button class="buy disabled">confirm</button>
        `;

        elContainer.insertAdjacentHTML('beforeend', PRODUCT_TEMPLATE)
    }

    const generateSizes = (sizes) => {
        let SIZE_TEMPLATE = ``;

        for (const variantIndex of sizes) {
            SIZE_TEMPLATE += `
            <button class="product-size">
                <div class="size">${variantIndex.selectedSize}</div>
                <div class="qty">${variantIndex.selectedQty}</div>
            </button>`
        }

        return SIZE_TEMPLATE;
    }

    const checkSelection = (product) => {
        const getSelectedSize = document.querySelectorAll('.product-size');

        for (const sizeIndex of getSelectedSize) {
            sizeIndex.addEventListener('click', () => {
                const size = sizeIndex.children[0].innerText;
                const qty = sizeIndex.children[1].innerText;

                selectedSize = size;
                currentQty = qty;

                for (const classIndex of getSelectedSize) {
                    classIndex.classList.remove('selected');
                }
                sizeIndex.classList.add('selected');

                if ($('.color-selection').hasClass("disabled")) $('.color-selection').removeClass("disabled");
                if ($('.qty-input').hasClass("disabled")) $('.qty-input').removeClass("disabled");

                $('.color-container').empty();
                $('.color-container').append(generateColors(size, product));

                $('.qty-count').empty();
                $('.qty-count').append(`/ ${qty}`);

                checkColor();
            })
        }
    }

    const generateColors = (size, product) => {
        const variants = product.variants;
        let COLOR_TEMPLATE = ``;

        for (const variantIndex of variants) {
            if (variantIndex.selectedSize === size) {

                for (const colorIndex of variantIndex.selectedColors) {
                    COLOR_TEMPLATE += `<button class="product-color" style="background-color: ${colorIndex}"></button>`
                }
                break;
            }
        }
        return COLOR_TEMPLATE;
    }

    const checkColor = () => {
        const availableColors = document.querySelectorAll('.product-color');
        for (const colorIndex of availableColors) {
            colorIndex.addEventListener('click', () => {
                for (const clearIndex of availableColors) {
                    clearIndex.classList.remove('selected')
                }

                if ($('.buy').hasClass("disabled")) $('.buy').removeClass("disabled");

                selectedColor = colorIndex.style.backgroundColor;
                colorIndex.classList.add('selected')
            })
        }
    }

    const checkQtyInputs = (product) => {
        const btnConfirmItem = document.querySelector('.buy');
        btnConfirmItem.addEventListener('click', () => {
            const inputQty = document.getElementById('inputQty').value;
            const value = Number(inputQty);

            //? Check if input quantity is a number
            if (!Number.isNaN(value)) {
                if (value <= currentQty && value > 0) {
                    selectedQty = value;
                    addItemToLiveCart(product);
                } else {
                    qtyInputErrorMessage('Within quantity only')
                }

            } else {
                qtyInputErrorMessage('Number only')
            }
        })
    }

    const qtyInputErrorMessage = (message) => {
        const inputQty = document.getElementById('inputQty')
        inputQty.value = null;
        inputQty.placeholder = message;
        inputQty.classList.add('error');

        setTimeout(() => {
            inputQty.classList.remove('error');
            inputQty.placeholder = 'Aa';
        }, 3000)
    }






    const addItemToLiveCart = (product) => {
        // Selected variants
        const size = selectedSize;
        const qty = selectedQty;
        const color = selectedColor;

        const item = {
            prodID: product.prodID,
            itemName: product.prodName,
            itemImg: `data:${product.productImages[0].type};base64,${product.productImages[0].data}`,
            itemSize: size,
            itemQty: qty,
            itemColor: color,
            itemPrice: Number(product.prodPrice)
        }

        addItemToCart(item).then(() => {
            // Update Database
            for (const variantIndex of product.variants) {
                if (variantIndex.selectedSize === size) {
                    const variantColors = variantIndex.selectedColors;
                    const variantQty = variantIndex.selectedQty;

                    processItem(product.prodID, size, qty, variantColors, variantQty).then(() => {
                        $('#liveToast').toast('show')
                        defaultOption();
                    })
                }
            }
        })
    };

    const updateModalChanges = (variants) => {
        const soldOut = [];

        // Check if there are sold out variants
        for (const checkQty of variants) {
            if (Number(checkQty.selectedQty) === 0) {
                soldOut.push(checkQty.selectedSize)
            }
        }

        // Element: Add to cart modal
        const updateModalSizesAndQty = document.querySelectorAll('.product-size');
        for (const [elIndex, elValue] of updateModalSizesAndQty.entries()) {
            if (soldOut.includes(elValue.children[0].innerText)) {
                elValue.setAttribute('disabled', '');
                elValue.classList.add('sold-out')
            }
            elValue.children[1].textContent = variants[elIndex].selectedQty;
        }

        // Element: Current displayed product
        const updateDisplayedSizesAndQty = document.querySelectorAll('.forDataChange')
        for (const [elIndex, elValue] of updateDisplayedSizesAndQty.entries()) {
            elValue.textContent = `${variants[elIndex].selectedSize} - ${variants[elIndex].selectedQty}Pcs`;
        }
    }


    const displayLiveCart = (itemData) => {
        let CART_TEMPLATE = '';
        let trimmedItemName;

        // cut item name if long
        if (itemData.itemName.length > 20) {
            let text = itemData.itemName;
            let cut = text.substring(0, 17);
            trimmedItemName = cut += '...';
        }

        const ITEM_TEMPLATE = `
                <div class="cart-item" data-item-id="${itemData.itemID}">
                <button class="remove-item">
                    <ion-icon name="trash"></ion-icon>
                </button>
                <button class="check-item">
                    <ion-icon name="bag-check"></ion-icon>
                </button>
                    <img src="${itemData.itemImg}"
                        alt="${itemData.itemName}">
                    <div class="item-detail">
                        <p class="name">${trimmedItemName ? trimmedItemName : itemData.itemName}</p>
                        <div class="variant">
                            <p>Size: <span>${itemData.itemSize}</span> | Quantity: <span>${itemData.itemQty}</span>pcs</p>
                        </div>
                        <div class="price">
                            <div class="color" style="background-color:${itemData.itemColor}"></div>
                            <p class="item-price">₱<span>${itemData.itemTotal}</span></p>
                        </div>
                    </div>
                </div>
            `;

        if (cartItemContainer.children[0].classList.contains('empty')) {
            $('.product-list').empty();
            CART_TEMPLATE += ITEM_TEMPLATE;
        } else {
            CART_TEMPLATE += ITEM_TEMPLATE;
        }
        cartItemContainer.insertAdjacentHTML('afterbegin', CART_TEMPLATE)

        // Start looping buttons when item is added in the cart
        initializeCartItemButtons(itemData)
    }

    let totalAmount = 0;
    const initializeCartItemButtons = (itemData) => {
        const btnCheckCartItem = document.querySelectorAll('.check-item');
        const btnRemoveCartItem = document.querySelectorAll('.remove-item');

        // Collect all selected items
        for (let i = 0; i < btnCheckCartItem.length; i++) {
            btnCheckCartItem[i].addEventListener('click', () => {
                const parentEl = btnCheckCartItem[i].parentElement;
                const itemID = parentEl.dataset.itemId;
                const itemPrice = parentEl.children[3].children[2].children[1].firstElementChild.textContent;

                if (btnCheckCartItem[i].classList.contains('checked')) {
                    btnCheckCartItem[i].classList.remove('checked');

                    // find and remove
                    const findIndex = selectedCartItems.itemsArray.indexOf(itemID);
                    selectedCartItems.itemsArray.splice(findIndex, 1);
                    totalAmount -= Number(itemPrice);

                } else {
                    btnCheckCartItem[i].classList.add('checked');
                    selectedCartItems.itemsArray.push(itemID)
                    totalAmount += Number(itemPrice);
                }
                checkoutLiveCart()
            })
            break;
        }

        // Remove item in live cart
        for (const btnRemoveIndex of btnRemoveCartItem) {
            btnRemoveIndex.addEventListener('click', () => {

                const parentEl = btnRemoveIndex.parentElement;
                const variantEl = parentEl.children[3].children[1];
                const cartSizeAndQty = variantEl.children[0];
                const size = cartSizeAndQty.children[0].innerHTML;
                const qty = cartSizeAndQty.children[1].innerHTML;


                const itemID = parentEl.dataset.itemId;


                removeItem(itemData.prodID, itemID, Number(qty), size).then(() => {
                    cartItemContainer.removeChild(parentEl);

                    if (cartItemContainer.childElementCount < 1) {
                        const EMPTY_CART_TEXT = `
                                <div class="empty">
                                    <p class="emoji">😕</p>
                                    <p class="text">Your cart is empty</p>
                                </div>
                            `;
                        cartItemContainer.insertAdjacentHTML('beforeend', EMPTY_CART_TEXT)
                    }
                })
            })
        }
    }

    const checkoutLiveCart = () => {
        const btnCheckout = document.getElementById("btnCheckout");
        const parentEl = btnCheckout.parentElement;

        // Place total amount
        parentEl.firstElementChild.lastElementChild.firstElementChild.textContent = totalAmount;

        if (selectedCartItems.itemsArray.length === 0) {
            btnCheckout.setAttribute('disabled', '');
            btnCheckout.classList.add('disabled');

        } else {
            btnCheckout.removeAttribute('disabled');
            btnCheckout.classList.remove('disabled')
        }
    }

    const defaultOption = () => {
        $('.color-selection').addClass("disabled");
        $('#inputQty').val("");
        $('.qty-count').empty();
        $('.qty-count').append(`/ ∞`);
        $('.qty-input').addClass("disabled");
        $('.buy').addClass("disabled");

        const getSelectedSize = document.querySelectorAll('.product-size');
        for (const classIndex of getSelectedSize) {
            classIndex.classList.remove('selected');
        }
    }

   



})

export {
    selectedCartItems,
}