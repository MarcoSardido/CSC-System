import { firebase } from '../../firebaseConfig.js';
import { getFirestore, getDoc, setDoc, doc } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";
const db = getFirestore(firebase)

$(document).ready(() => {
    //! ---------------------------------------------------------------------------------
    //                           Toggle display and add products
    //! ---------------------------------------------------------------------------------

    $('#slideToAddProduct').click(() => {
        $('#addProduct_slider').animate({ width: "100%" }, 500).find('#slideCont').animate({ width: "100%" }, 500);
    });

    $('#closeAddProduct_slider').click(() => {
        $('#addProduct_slider').animate({ width: "0%" }, 500);
    })



    //! ---------------------------------------------------------------------------------
    //                                  Adding product
    //! ---------------------------------------------------------------------------------

    //* Toggle product varieties
    $('#addSize').click(() => {
        $('.addSize-wrapper').addClass('show');
    });
    $('.close').click(() => {
        $('.addSize-wrapper').removeClass('show');
    })


    //* Quantity input
    $('#slide-range').on('input', () => {
        $("#input-quantity").val($('#slide-range').val())
    });
    $('#input-quantity').on('input', () => {
        $('#slide-range').val($('#input-quantity').val())
    });


    //* Color selection
    let selected_color = [];
    const colorsContainer = document.querySelector('.availableColors-cont');
    let availableColors = colorsContainer.children;
    $('#color-picker').spectrum({
        type: 'flat',
        allowEmpty: false,
        clickoutFiresChange: false,
        change: function (color) {
            for (let hasColor = 0; hasColor < availableColors.length; hasColor++) {

                let firstChild = availableColors[hasColor];
                if (firstChild.classList.contains('hasColor')) {
                    continue;
                } else {
                    availableColors[hasColor].style.background = color.toHexString();
                    availableColors[hasColor].classList = 'add-color hasColor';
                    selected_color.push(availableColors[hasColor].style.background = color.toHexString());
                }
                break;
            }
        },
    });


    //* Size Selection
    let getSelectedSize;
    const getAllSizes = document.querySelectorAll('.sizes');
    for (let i = 0; i < getAllSizes.length; i++) {
        getAllSizes[i].onclick = () => {
            let j = 0;

            while (j < getAllSizes.length) {
                getAllSizes[j++].classList = 'sizes';
            }
            getAllSizes[i].classList = 'sizes selected';
            getSelectedSize = getAllSizes[i].value;
        }
    }


    //*  Adding product variant
    const variantsContainer = document.querySelector('.sizesQty-cont');
    let variant = variantsContainer.children;
    const allVariants = [];
    $('.submitSizesAndQty').click(() => {
        let qtyVal;
        let colors = selected_color
        let variantObj = {};
        let variantCol = document.createElement('div')
        variantCol.classList.add('sizesQty', 'done')

        // Adding all data into one object
        qtyVal = $('#input-quantity').val();
        Object.assign(variantObj,
            { 'selectedColors': colors },
            { 'selectedQty': qtyVal },
            { 'selectedSize': getSelectedSize ? getSelectedSize : 'N/A' }
        )

        allVariants.push(variantObj)

        let variantContents = `
            <div class="add-size">
                <span class="size">${variantObj.selectedSize}</span>
                <div class="badge-cont">
                    <span class="badge">${variantObj.selectedQty}pcs</span>
                </div>
            </div>
            <div class="add-color hasColor" style="background-color:${variantObj.selectedColors[0]}"></div>
            <div class="add-color hasColor" style="background-color:${variantObj.selectedColors[1]}"></div>
            <div class="add-color hasColor" style="background-color:${variantObj.selectedColors[2]}"></div>
            <div class="add-color hasColor" style="background-color:${variantObj.selectedColors[3]}"></div>
            <div class="add-color hasColor" style="background-color:${variantObj.selectedColors[4]}"></div>
        `;

        for (let isDone = 0; isDone < variant.length; isDone++) {
            let firstChild = variant[isDone];
            if (firstChild.classList.contains('done')) {
                continue;
            } else {
                variantsContainer.removeChild(variant[isDone])
                variantCol.innerHTML = variantContents;
                variantsContainer.prepend(variantCol)
                selected_color = [];
            }
            break;
        }

        // Clearing object
        clearInputs();
    })


    //! ---------------------------------------------------------------------------------
    //                            Product Type Function
    //! ---------------------------------------------------------------------------------

    const prodTypeContainer = document.querySelector('.prodType-cont');
    let prodType = prodTypeContainer.children;
    let selectedTrends = [];

    for (const type of prodType) {
        type.addEventListener('click', () => {
            let removeIndex;

            if (type.firstElementChild.classList.contains('selectedTrend')) {
                type.firstElementChild.classList.remove('selectedTrend')
                selectedTrends.includes(type.children[1].textContent)
                removeIndex = selectedTrends.indexOf(type.children[1].textContent)
                selectedTrends.splice(removeIndex, 1)
            } else {
                type.firstElementChild.classList.add('selectedTrend')
                selectedTrends.push(type.children[1].textContent)
            }
        })
    }



    //! ---------------------------------------------------------------------------------
    //                            Finalization
    //! ---------------------------------------------------------------------------------

    const selectProdCat = document.getElementById('productCategory');
    const btnCompleteVariants = document.querySelector('.editDone');
    btnCompleteVariants.addEventListener('click', () => {
        const computedColors = {};
        const convertedArray = [];

        clearTrends(prodType);

        allVariants.push(selectProdCat.value)
        allVariants.push(selectedTrends)

        for (const variant of allVariants) {
            if (variant.hasOwnProperty('selectedColors')) {
                convertedArray.push(variant.selectedColors)
            }
        }

        const allColors = [].concat(...convertedArray);
        allColors.forEach(index => {
            computedColors[index] = (computedColors[index] || 0) + 1;
        });


        const displayColor = [];
        const lengthOfColors = Object.keys(computedColors).length;
        if (lengthOfColors <= 5) {
            // If overall colors length is 5, then display all colors
            displayColor.push(computedColors)
        } else {
            const firstFive = Object.keys(computedColors).slice(0, 5)
            // If overall colors length is > 5, display only the first five colors;
            for (const item of firstFive) {
                displayColor.push(item)
            }
        }

        const toDisplay = [];
        const sizesAndQty = [];
        for (const variant of allVariants) {
            if (variant.hasOwnProperty('selectedColors')) {
                sizesAndQty.push({
                    size: variant.selectedSize,
                    qty: variant.selectedQty
                })
            }
        }

        toDisplay.push({
            items: sizesAndQty,
            itemColors: displayColor,
            itemTrends: allVariants[allVariants.length - 1]
        })

        displayVariant(toDisplay)
        getVariantObj(allVariants, displayColor)
        variantObject(allVariants)
    })



    //! ---------------------------------------------------------------------------------
    //                            Displaying Function
    //! ---------------------------------------------------------------------------------

    const displayVariant = (displayObject) => {

        const displayItems = displayObject[0].items;
        const displayTrends = displayObject[0].itemTrends;
        const checkColors = Object.keys(displayObject[0].itemColors[0]);
        const displayColors = checkColors.length === 5 || checkColors.length < 5 ? checkColors : displayObject[0].itemColors;

        //* --------------------------------Displaying Colors-----------------------------------------
        const parentComponentColors = document.querySelector('.color-field').children[1];
        const displayColorsContainer = parentComponentColors.children;

        for (let isColorDisplayed = 0; isColorDisplayed < displayColors.length; isColorDisplayed++) {

            let firstChild = displayColorsContainer[isColorDisplayed];

            if (firstChild.classList.contains('hasColor')) {
                continue;
            } else {
                displayColorsContainer[isColorDisplayed].style.background = displayColors[isColorDisplayed];
                displayColorsContainer[isColorDisplayed].classList.add('hasColor');
            }
        }

        //* --------------------------------Displaying Product Type-----------------------------------
        const parentComponent = document.querySelector('.type-field').children[1];
        const displayProdTypeContainer = parentComponent.children;

        for (let isTypeDisplayed = 0; isTypeDisplayed < displayTrends.length; isTypeDisplayed++) {
            let firstChild = displayProdTypeContainer[isTypeDisplayed];

            if (firstChild.classList.contains('hasType')) {
                continue;
            } else {

                const typeIcon = displayTrends[isTypeDisplayed] === 'Trending' ? 'trending'
                    : displayTrends[isTypeDisplayed] === 'New Arrival' ? 'arrival'
                        : 'sale';

                const typeName = displayTrends[isTypeDisplayed] === 'Trending' ? 'flash'
                    : displayTrends[isTypeDisplayed] === 'New Arrival' ? 'heart'
                        : 'analytics';

                const prodTypeContent = `<ion-icon class="icon-${typeIcon}" name="${typeName}"></ion-icon>`;

                displayProdTypeContainer[isTypeDisplayed].insertAdjacentHTML('beforeend', prodTypeContent)
                displayProdTypeContainer[isTypeDisplayed].classList.add('hasType', typeIcon);
            }
        }

        //* --------------------------------Displaying Size and Quantity--------------------------------
        const displaySizeContainer = document.querySelector('.size-cont').children;

        for (const [index, item] of displayItems.entries()) {
            const firstChild = displaySizeContainer[index];

            if (firstChild.classList.contains('hasSize')) {
                continue;
            } else {

                const sizeQtyContent = `
                    <span class="size">${item.size ? item.size : 'N/A'}</span>
                    <div class="badge-cont">
                        <span class="badge">${item.qty}pcs</span>
                    </div>
                `;

                displaySizeContainer[index].classList.add('hasSize');
                displaySizeContainer[index].insertAdjacentHTML('beforeend', sizeQtyContent)
            }
        }

        //* -----------------------------UnDisable Preview Button-----------------------------
        const btnPreview = document.querySelector('.btnPreviewProduct');
        btnPreview.classList.remove('statusDisabled');
        btnPreview.removeAttribute('disabled');
    }


    //! ---------------------------------------------------------------------------------
    //                            Product Image
    //! ---------------------------------------------------------------------------------

    const insertProductImages = (imageMimeTypes, parsedImg, acceptedImg, productImg) => {

        for (let parsedImgLooper = 0; parsedImgLooper < productImg.length; parsedImgLooper++) {
            parsedImg.push(JSON.parse(productImg[parsedImgLooper].value));
        }

        for (let acceptedImgLooper = 0; acceptedImgLooper < parsedImg.length; acceptedImgLooper++) {
            if (imageMimeTypes.includes(parsedImg[acceptedImgLooper].type)) {
                acceptedImg.push(parsedImg[acceptedImgLooper]);
            };
        }

        let trimmedImgObj = [];
        for (const iterator of acceptedImg) {
            trimmedImgObj.push({
                data: iterator.data,
                type: iterator.type
            })
        }
        imgObject(trimmedImgObj)

        const imgContainer = document.querySelector('.prodImg-cont');

        if (acceptedImg.length > 1) {
            const container = document.createElement('div');
            imgContainer.appendChild(container);

            const imageContent = `
                <div class="mainImg" id="mainImg_Cont">
                    <img src="data:${acceptedImg[0].type};base64,${acceptedImg[0].data}" alt="${acceptedImg[0].name.split('.')[0]}">
                </div>
                <div class="subImg">
                    ${acceptedImg[1] ? `<div id="subImg_Cont" class="prodImages">
                    <img src="data:${acceptedImg[1].type};base64,${acceptedImg[1].data}" alt="${acceptedImg[1].name.split('.')[0]}">
                </div>` : ''}
                    ${acceptedImg[2] ? `<div id="subImg_Cont" class="prodImages">
                    <img src="data:${acceptedImg[2].type};base64,${acceptedImg[2].data}" alt="${acceptedImg[2].name.split('.')[0]}">
                </div>` : ''}
                    
                    ${acceptedImg[3] ? `<div id="subImg_Cont" class="prodImages moreImg">
                    <p class="more" id="subImg_Text">View More</p>
                    <img src="data:${acceptedImg[3].type};base64,${acceptedImg[3].data}" alt="${acceptedImg[3].name.split('.')[0]}">
                </div>` : ''}
                    
                </div>
            `;

            container.insertAdjacentHTML('beforeend', imageContent)

        } else {
            // Only 1
            const container = document.createElement('div');
            imgContainer.appendChild(container);

            const imageContent = `
                <div class="mainImg" id="mainImg_Cont">
                    <img src="data:${acceptedImg[0].type};base64,${acceptedImg[0].data}" alt="${acceptedImg[0].name.split('.')[0]}">
                </div>
            `;

            container.insertAdjacentHTML('beforeend', imageContent)
        }

    };


    //! ---------------------------------------------------------------------------------
    //                            Product Preview Section
    //! ---------------------------------------------------------------------------------

    // Product Images
    const productImg = document.getElementsByName('filepondProducts');

    const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/PNG'];
    const parsedImg = [];
    const acceptedImg = [];

    // get variants { size, qty, colors, prodType }
    let displayVariantObj = {};
    let displayColorObj;

    const getVariantObj = (allVariants, variantColors) => {
        displayVariantObj = allVariants;
        displayColorObj = variantColors;
    }
    // Preview product
    const btnProductPreview = document.getElementById('productPreview');
    btnProductPreview.addEventListener('click', () => {

        //* ---------------------Images-----------------------
        // Add images inside modal
        insertProductImages(
            imageMimeTypes, parsedImg, acceptedImg, productImg)

        //* ---------------------Details----------------------

        // Detail Elements
        const prodNameEl = document.querySelector('.prodName');
        const prodPriceEl = document.querySelector('.prodPrice');
        const prodDescEl = document.querySelector('.prodDesc');

        // Detail Data
        const prodName = document.getElementById('txtProductName').value;
        const prodPrice = document.getElementById('txtProductPrice').value;
        const prodDesc = document.getElementById('txtProductDesc').value;

        const elements = [prodNameEl, prodPriceEl, prodDescEl];
        const data = [prodName, prodPrice, prodDesc];

        for (let detailIndex = 0; detailIndex < elements.length; detailIndex++) {
            let textToAdd = document.createTextNode(data[detailIndex]);
            elements[detailIndex].appendChild(textToAdd);
        }

        detailObject(data)

        //* ---------------------Variants----------------------
        let allQty = 0;
        let allSizes = [];
        for (const mainVariant of displayVariantObj) {
            if (mainVariant.hasOwnProperty('selectedColors')) {
                allQty += Number(mainVariant.selectedQty)
                allSizes.push(mainVariant.selectedSize);
            }
        }

        const checkDisplayColors = Object.keys(displayColorObj[0]);
        const displayColors = checkDisplayColors.length === 5 || checkDisplayColors.length < 5 ? checkDisplayColors : displayColorObj;
        const displayTrends = displayVariantObj[displayVariantObj.length - 1];

        // Qty and Product Type
        const qtyAndTypeSection = document.querySelector('.prodQtyAndType-field');

        const generateProdTypeElement = (displayTrends) => {
            let prodTypes = '';

            for (let trendsIndex = 0; trendsIndex < displayTrends.length; trendsIndex++) {
                const typeClass = displayTrends[trendsIndex] === 'Trending' ? 'trend'
                    : displayTrends[trendsIndex] === 'New Arrival' ? 'arrival'
                        : 'sale';

                const typeName = displayTrends[trendsIndex] === 'Trending' ? 'flash'
                    : displayTrends[trendsIndex] === 'New Arrival' ? 'heart'
                        : 'analytics';

                prodTypes += `
                <div class="type-cont">
                    <div class="typeIcon ${typeClass}">
                        <ion-icon name="${typeName}"></ion-icon>
                    </div>
                    <p class="typeText">${displayTrends[trendsIndex]}</p>
                </div>
                `;
            }
            return prodTypes;
        }

        const qtyAndTypeContent = `
            <div class="qty-cont">
                <div class="iconWithVal">
                    <ion-icon name="checkmark-sharp"></ion-icon>
                    <p class="qtyVal">${allQty}</p>
                </div>
                <p class="qtyTitle">Available Units</p>
            </div>
            ${generateProdTypeElement(displayTrends)}
        `;
        qtyAndTypeSection.insertAdjacentHTML('beforeend', qtyAndTypeContent)

        // Colors
        const colorsSection = document.querySelector('.varieties').children[2].children[1];
        const colorContainer = colorsSection.children;

        for (let colorIndex = 0; colorIndex < displayColors.length; colorIndex++) {
            colorContainer[colorIndex].style.backgroundColor = displayColors[colorIndex];
        }


        // Sizes
        const sizeSection = document.querySelector('.varieties').children[3].children[1];
        const sizeAndQty = [];

        for (const itemVariant of displayVariantObj) {
            if (itemVariant.hasOwnProperty('selectedColors')) {
                sizeAndQty.push({
                    itemQty: itemVariant.selectedQty,
                    itemSize: itemVariant.selectedSize
                })
            }
        }

        const generateQtyAndSizeElement = (sizeAndQty) => {
            let qtyAndSize = '';

            for (let trendsIndex = 0; trendsIndex < sizeAndQty.length; trendsIndex++) {
                qtyAndSize += `
                    <div class="sizes">
                        <p class="sizeTitle">${sizeAndQty[trendsIndex].itemSize}</p>
                        <p class="sizeQty">(${sizeAndQty[trendsIndex].itemQty})</p>
                    </div>
                `;
            }
            return qtyAndSize;
        }
        const qtyAndSizeContent = generateQtyAndSizeElement(sizeAndQty);
        sizeSection.insertAdjacentHTML('beforeend', qtyAndSizeContent)

    })

    // Go back to adding product
    const btnBackToProductModal = document.getElementById('closeProductPreview');
    btnBackToProductModal.addEventListener('click', () => {

        // Clear images inside modal
        clearPreviewImages(parsedImg, acceptedImg)

        clearDetailData();
    });


    //! ---------------------------------------------------------------------------------
    //                            Partial Function
    //! ---------------------------------------------------------------------------------

    const clearInputs = () => {
        $('#input-quantity').val(20)
        getSelectedSize = '';

        // Unclick selected size button
        for (let i = 0; i < getAllSizes.length; i++) {
            getAllSizes[i].classList = 'sizes';
        }

        // Remove all selected colors
        for (let i = 0; i < availableColors.length; i++) {
            availableColors[i].classList.remove('hasColor');
            availableColors[i].removeAttribute("style");
        }
    }

    const clearTrends = (children) => {
        for (const child of children) {
            if (!child.firstElementChild.classList.contains('selectedTrend')) continue;
            child.firstElementChild.classList.remove('selectedTrend')
        }
    }

    const clearDetailData = () => {
        document.querySelector('.prodName').innerHTML = '';
        document.querySelector('.prodPrice').innerHTML = '';
        document.querySelector('.prodDesc').innerHTML = '';

        document.querySelector('.qtyVal').innerHTML = '';

        const qtyAndTypeSection = document.querySelector('.varieties').children[0];
        while (qtyAndTypeSection.firstChild) {
            qtyAndTypeSection.removeChild(qtyAndTypeSection.firstChild);
        }

        const sizeSectionSection = document.querySelector('.varieties').children[3].children[1];
        while (sizeSectionSection.firstChild) {
            sizeSectionSection.removeChild(sizeSectionSection.firstChild);
        }
    }

    const clearPreviewImages = (parsedImg, acceptedImg) => {
        parsedImg.splice(0, parsedImg.length);
        acceptedImg.splice(0, acceptedImg.length);

        const imgContainer = document.querySelector('.prodImg-cont');
        imgContainer.removeChild(imgContainer.firstChild)
    }


    //! ---------------------------------------------------------------------------------
    //                                          API
    //! ---------------------------------------------------------------------------------

    let variantData, detailData, imgData;
    const variantObject = (data) => {
        variantData = data;
    }
    const detailObject = (data) => {
        detailData = data;
    }
    const imgObject = (data) => {
        imgData = data;
    }

    document.querySelector('.btnSavePreview').addEventListener('click', () => {
        addProduct();
    })

    const addProduct = async () => {
        const uuid = document.getElementById('uid').textContent;
        const trimmedID = uuid.trim();
        const actLogID = `log_${generateId()}`
        const productId = `productID_${generateId()}`;
        const productTypes = variantData[variantData.length - 1];
        variantData.pop();
        const productCategory = variantData[variantData.length - 1];
        variantData.pop();

        try {
            //* COLLECTION: Accounts
            const accountDocRef = doc(db, `Accounts/seller_${trimmedID}`);
            const accountDocument = await getDoc(accountDocRef)

            await setDoc(doc(db, `Sellers/${trimmedID}/Products`, productId), {
                prodID: productId,
                prodName: detailData[0],
                prodDesc: detailData[2],
                prodPrice: detailData[1],
                prodType: productTypes,
                prodCategory: productCategory,
                variants: variantData,
                productImages: imgData,
            }, { merge: true })

            await setDoc(doc(db, `Accounts/seller_${trimmedID}/Activity Logs`, actLogID), {
                name: accountDocument.data().displayName,
                type: ['Product', 'Added', productId],
                dateAdded: new Date()
            })

            location.reload();

        } catch (error) {
            console.log(`Firestore Error: Adding Product -> ${error.message}`)
        }
    }

    const generateId = () => {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < 10; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }
});