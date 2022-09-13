import { getAllProducts, getProduct, getFilteredProducts } from './Api/products.js'

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    const urlOrigin = window.location.pathname;
    const getRoomId = urlOrigin.split('/');
    const liveRoomID = getRoomId[getRoomId.length - 1];

    //* ----------------------------------------------------------------------------------------
    //  ---------------------------------- Global Selectors ------------------------------------ 
    //* ---------------------------------------------------------------------------------------- 
    const productContainer = document.getElementById('prodContainer');
    const categoryList = document.getElementById('dynamicCategoryList');
    const sizeList = document.getElementById('dynamicSizeList');
    const typeList = document.getElementById('dynamicTypeList');
    const btnClearFilter = document.getElementById('btnClearFilter');

    //* :: Modal
    const modalContainer = document.getElementById('dynamicAddToCartModal');



    const loader = () => {
        const LOADER_TEMPLATE = `
            <div class="spinner-border text-primary loader" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        `;

        productContainer.insertAdjacentHTML('beforeend', LOADER_TEMPLATE);
    }

    const generateProductItem = (productData) => {
        let product_template = ``;

        const generateVarieties = (varietyData) => {
            let variety_template = ``;

            for (const varietyIndex of varietyData) {
                variety_template += `
                    <div class="size">${varietyIndex.selectedSize}</div>
                `;
            }

            return variety_template;
        }

        const generateTypes = (typeData) => {
            let type_template = ``;

            for (const typeIndex of typeData) {
                const checkTypeForClass = typeIndex === 'Trending' ? 'trend' :
                    typeIndex === 'New Arrival' ? 'new' : 'sale';

                const checkTypeForIcon = typeIndex === 'Trending' ? 'flash' :
                    typeIndex === 'New Arrival' ? 'heart' : 'analytics';

                type_template += `
                    <div class="type ${checkTypeForClass}">
                        <ion-icon name="${checkTypeForIcon}"></ion-icon>
                    </div>
                `;
            }

            return type_template;
        }

        for (const productIndex of productData) {
            product_template += `
                <div class="product">
                    <div class="product-image">
                        <img
                            src="data:${productIndex.productImages[0].type};base64,${productIndex.productImages[0].data}">
                        <div class="variety">
                            <div class="size-container">
                                ${generateVarieties(productIndex.variants)}
                            </div>
                        </div>
                    </div>
                    <div class="product-details">
                        <div class="detail-wrapper">
                            <p class="item-name">${productIndex.prodName}</p>
                            <p class="item-price">₱<span class="price">${Number(productIndex.prodPrice.toLocaleString())}</span></p>
                        </div>
                        <div class="type-container">
                            ${generateTypes(productIndex.prodType)}
                        </div>
                    </div>
                    <div class="product-button">
                        <button class="addToCart-button" data-prod-id="${productIndex.prodID}">Add To Cart</button>
                    </div>
                </div>
            `;
        }

        productContainer.insertAdjacentHTML('beforeend', product_template)
    }


    //* FILTER
    const generateCategoryFilter = (filterData) => {
        let category_template = ``;

        for (const filterIndex of filterData) {
            const ids = Array.isArray(filterIndex.prodID) ? filterIndex.prodID.toString() : filterIndex.prodID;

            category_template += `
                <li data-product-ids='${ids}'>
                    <div class="list-wrapper">
                        <p class="label">${filterIndex.category}</p>
                        <p class="count">${filterIndex.quantity}</p>
                    </div>
                </li>
            `;
        }

        categoryList.insertAdjacentHTML('beforeend', category_template)
    }

    const generateSizeFilter = (filterData) => {
        let size_template = ``;

        for (const filterIndex of filterData) {
            const ids = Array.isArray(filterIndex.ID) ? filterIndex.ID.toString() : filterIndex.ID;

            size_template += `
                <li data-product-ids='${ids}'>
                    <div class="list-wrapper">
                        <p class="label">${filterIndex.size}</p>
                        <p class="count">${filterIndex.quantity}</p>
                    </div>
                </li>
            `;
        }

        sizeList.insertAdjacentHTML('beforeend', size_template)
    }

    const generateTypeFilter = (filterData) => {
        let type_template = ``;

        for (const filterIndex of filterData) {
            const ids = Array.isArray(filterIndex.ID) ? filterIndex.ID.toString() : filterIndex.ID;

            const checkTypeForClass = filterIndex.type === 'Trending' ? 'trend' :
                filterIndex.type === 'New Arrival' ? 'new' : 'sale';

            const checkTypeForIcon = filterIndex.type === 'Trending' ? 'flash' :
                filterIndex.type === 'New Arrival' ? 'heart' : 'analytics';

            type_template += `
                <li data-product-ids='${ids}'>
                    <div class="list-wrapper">
                        <p class="label">
                            ${filterIndex.type}
                            <span class="${checkTypeForClass}">
                                <ion-icon name="${checkTypeForIcon}"></ion-icon>
                            </span>
                        </p>
                        <p class="count">${filterIndex.quantity}</p>
                    </div>
                </li>
            `;
        }

        typeList.insertAdjacentHTML('beforeend', type_template)
    }

    const productFilter = (productData) => {
        const categoryArrObj = [], mainSizeArray = [], mainTypeArray = [];
        const tempTypeArray = [];

        for (const productIndex of productData) {
            let sizeArray = [], typeArray = [], prodIDArray = [];

            // Add product category
            categoryArrObj.push({
                prodID: productIndex.prodID,
                category: productIndex.prodCategory
            });

            for (const typeIndex of productIndex.prodType) {
                if (mainTypeArray.length !== 0) {

                    if (!tempTypeArray.includes(typeIndex)) {
                        tempTypeArray.push(typeIndex);
                        mainTypeArray.push({
                            type: typeIndex,
                        });
                    }

                } else {
                    tempTypeArray.push(typeIndex);
                    mainTypeArray.push({
                        type: typeIndex,
                    });
                }
            }

            typeArray = [...productIndex.prodType];

            for (const varietyIndex of productIndex.variants) {
                sizeArray.push(varietyIndex.selectedSize);

                if (mainSizeArray.length !== 0) {
                    if (!mainSizeArray.includes(varietyIndex.selectedSize)) {
                        mainSizeArray.push(varietyIndex.selectedSize);
                    }
                } else {
                    mainSizeArray.push(varietyIndex.selectedSize);
                }
            }
            categoryArrObj[categoryArrObj.length - 1].quantity = 1;
            categoryArrObj[categoryArrObj.length - 1].type = typeArray;
            categoryArrObj[categoryArrObj.length - 1].size = sizeArray;
        }
        categoryArrObj.sort((a, b) => a.category.localeCompare(b.category));



        //* Filter: SIZE :: Create Object
        let sizeArrObj = [], banSizeArray = [], acceptedSize = [];
        for (let sizeIndex1 = 0; sizeIndex1 < categoryArrObj.length; sizeIndex1++) {
            // Check last array value
            if (sizeIndex1 === categoryArrObj.length - 1) {
                const lastSize = categoryArrObj[sizeIndex1];

                for (const iterator of sizeArrObj) {
                    acceptedSize.push(iterator.size)
                }

                for (const lastSizeIndex of lastSize.size) {
                    if (!acceptedSize.includes(lastSizeIndex)) {
                        sizeArrObj.push({
                            ID: [lastSize.prodID],
                            size: lastSizeIndex,
                            quantity: lastSize.quantity
                        })
                    }
                }

            } else {
                for (let sizeIndex2 = sizeIndex1 + 1; sizeIndex2 < categoryArrObj.length; sizeIndex2++) {
                    const size1 = categoryArrObj[sizeIndex1].size;
                    const size2 = categoryArrObj[sizeIndex2].size;

                    // check size1 is included in size2
                    for (const size1Loop of size1) {
                        if (!banSizeArray.includes(size1Loop)) {
                            if (size2.includes(size1Loop)) {
                                sizeArrObj.push({
                                    ID: [categoryArrObj[sizeIndex1].prodID, categoryArrObj[sizeIndex2].prodID],
                                    size: size1Loop,
                                    quantity: categoryArrObj[sizeIndex1].quantity + categoryArrObj[sizeIndex2].quantity
                                })
                            }
                        }
                    }
                }
            }

            if (banSizeArray.length === 0) {
                for (const iterator of categoryArrObj[sizeIndex1].size) {
                    if (sizeArrObj.length === 0) {
                        sizeArrObj.push({
                            ID: [categoryArrObj[sizeIndex1].prodID],
                            size: iterator,
                            quantity: categoryArrObj[sizeIndex1].quantity
                        })
                    } else {
                        for (const sizeArrIndex of sizeArrObj) {
                            if (!iterator === sizeArrIndex.size) {
                                sizeArrObj.push({
                                    ID: [categoryArrObj[sizeIndex1].prodID],
                                    size: iterator,
                                    quantity: categoryArrObj[sizeIndex1].quantity
                                })
                            }
                        }
                    }
                }
                banSizeArray.push(...categoryArrObj[sizeIndex1].size);
            } else {
                for (const iterator of categoryArrObj[sizeIndex1].size) {
                    for (const sizeArrIndex of sizeArrObj) {
                        if (!iterator === sizeArrIndex.size) {
                            sizeArrObj.push({
                                ID: [categoryArrObj[sizeIndex1].prodID],
                                size: iterator,
                                quantity: categoryArrObj[sizeIndex1].quantity
                            })
                        }
                    }
                    if (!banSizeArray.includes(iterator)) {
                        banSizeArray.push(iterator)
                    }
                }
            }
        }
        //* Filter: SIZE :: Custom Sort Size
        const sortOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'N/A'];
        sizeArrObj.sort((a, b) => {
            return sortOrder.indexOf(a.size) - sortOrder.indexOf(b.size);
        })



        //* Filter: TYPE :: Create Object
        let typeArrObj = [], banTypeArray = [], acceptedType = [];
        for (let typeIndex1 = 0; typeIndex1 < categoryArrObj.length; typeIndex1++) {

            // Check last array value
            if (typeIndex1 === categoryArrObj.length - 1) {
                const lastType = categoryArrObj[typeIndex1];

                for (const iterator of typeArrObj) {
                    acceptedType.push(iterator.type)
                }

                for (const lastTypeIndex of lastType.type) {
                    if (!acceptedType.includes(lastTypeIndex)) {
                        typeArrObj.push({
                            ID: [lastType.prodID],
                            type: lastTypeIndex,
                            quantity: lastType.quantity
                        })
                    }
                }
            } else {
                for (let typeIndex2 = typeIndex1 + 1; typeIndex2 < categoryArrObj.length; typeIndex2++) {
                    const type1 = categoryArrObj[typeIndex1].type;
                    const type2 = categoryArrObj[typeIndex2].type;

                    // check type1 is included in type2
                    for (const type1Loop of type1) {
                        if (!banTypeArray.includes(type1Loop)) {
                            if (type2.includes(type1Loop)) {
                                typeArrObj.push({
                                    ID: [categoryArrObj[typeIndex1].prodID, categoryArrObj[typeIndex2].prodID],
                                    type: type1Loop,
                                    quantity: categoryArrObj[typeIndex1].quantity + categoryArrObj[typeIndex2].quantity
                                })
                            }
                        }
                    }
                }
            }

            if (banTypeArray.length === 0) {
                for (const iterator of categoryArrObj[typeIndex1].type) {
                    if (typeArrObj.length === 0) {
                        typeArrObj.push({
                            ID: [categoryArrObj[typeIndex1].prodID],
                            type: iterator,
                            quantity: categoryArrObj[typeIndex1].quantity
                        })
                    } else {
                        for (const typeArrIndex of typeArrObj) {
                            if (!iterator === typeArrIndex.type) {
                                typeArrObj.push({
                                    ID: [categoryArrObj[typeIndex1].prodID],
                                    type: iterator,
                                    quantity: categoryArrObj[typeIndex1].quantity
                                })
                            }
                        }
                    }
                }
                banTypeArray.push(...categoryArrObj[typeIndex1].type);
            } else {
                for (const iterator of categoryArrObj[typeIndex1].type) {
                    for (const typeArrIndex of typeArrObj) {
                        if (!iterator === typeArrIndex.type) {
                            typeArrObj.push({
                                ID: [categoryArrObj[typeIndex1].prodID],
                                type: iterator,
                                quantity: categoryArrObj[typeIndex1].quantity
                            })
                        }
                    }
                    if (!banTypeArray.includes(iterator)) {
                        banTypeArray.push(iterator)
                    }
                }
            }
        }
        //* Filter: TYPE :: Merge Object
        for (let mergeType1 = 0; mergeType1 < typeArrObj.length; mergeType1++) {
            for (let mergeType2 = mergeType1 + 1; mergeType2 < typeArrObj.length; mergeType2++) {

                const type1 = typeArrObj[mergeType1];
                const type2 = typeArrObj[mergeType2];

                const type1ID = typeArrObj[mergeType1].ID;

                if (type1.type === type2.type) {
                    if (!type1ID.includes(type2.ID[1])) {
                        type1ID.push(type2.ID[1])
                    }
                    type1.quantity = type1.quantity + 1;
                    type2.quantity = NaN;
                    type2.remove = true;
                }

            }
        }
        //* Filter: TYPE :: Remove Duplicate Type
        let removeTypeArray = [];
        for (const [iterator, value] of typeArrObj.entries()) {
            if (value.hasOwnProperty('remove')) {
                removeTypeArray.push(iterator);
            }
        }
        typeArrObj = typeArrObj.filter((value, index) => {
            return removeTypeArray.indexOf(index) == -1;
        })



        //* Filter: CATEGORY :: Merge Duplicate
        for (let category1 = 0; category1 < categoryArrObj.length; category1++) {
            let prodIDArray = [];
            for (let category2 = category1 + 1; category2 < categoryArrObj.length; category2++) {
                if (categoryArrObj[category1].category === categoryArrObj[category2].category) {

                    // Merge IDs
                    prodIDArray.push(categoryArrObj[category1].prodID, categoryArrObj[category2].prodID)
                    delete categoryArrObj[category1].prodID;
                    delete categoryArrObj[category2].prodID;
                    categoryArrObj[category1].prodID = prodIDArray;

                    // Merge Quantity
                    const quantity1 = categoryArrObj[category1].quantity;
                    const quantity2 = categoryArrObj[category2].quantity;
                    const total = quantity1 + quantity2;
                    categoryArrObj[category1].quantity = total;

                    // Merge Size
                    const size1 = categoryArrObj[category1].size;
                    const size2 = categoryArrObj[category2].size;
                    const sizeChecker = size1.length > size2.length ? size1 : size2;
                    for (const size1Index of sizeChecker) {
                        if (!size1.includes(size1Index)) {
                            size1.push(size1Index)
                        }
                    }

                    // Merge Type
                    const type1 = categoryArrObj[category1].type;
                    const type2 = categoryArrObj[category2].type;
                    const typeChecker = type1.length > type2.length ? type1 : type2;
                    for (const type1Index of typeChecker) {
                        if (!type1.includes(type1Index)) {
                            type1.push(type1Index)
                        }
                    }

                    categoryArrObj[category2].remove = true;
                }
            }
        }

        //* Filter: CATEGORY :: Remove Duplicate
        const removeArray = [];
        for (const [findIndex, findValue] of categoryArrObj.entries()) {
            if (findValue.hasOwnProperty('remove')) {
                removeArray.push(findIndex);
            }
        }
        for (const removeIndex of removeArray) {
            categoryArrObj.splice(removeIndex, 1);
        }

        //* Filter: CATEGORY :: Remove Size & Type
        for (const removePropIndex of categoryArrObj) {
            delete removePropIndex.size;
            delete removePropIndex.type;
        }



        // console.log(sizeArrObj)
        // console.log(typeArrObj)
        // console.log(categoryArrObj)

        generateCategoryFilter(categoryArrObj);
        generateSizeFilter(sizeArrObj);
        generateTypeFilter(typeArrObj);
    }


    //* SELECT FILTER
    const generateFilteredProducts = (filterIDs) => {
        const productIDs = filterIDs.split(',');

        getFilteredProducts(liveRoomID, productIDs).then(data => {

            // Remove recent displayed products
            $('#prodContainer').empty();

            // Display filtered products
            generateProductItem(data);

            addToCartModal();
        })
    }

    const selectFilter = () => {
        const filter = document.querySelectorAll('li');

        for (const filterIndex of filter) {
            filterIndex.addEventListener('click', () => {

                // Remove class "Active" in all List Item
                for (const removeActiveClass of filter) {
                    removeActiveClass.classList.remove('active');
                }

                // Add class "Active" in List Item
                filterIndex.classList.add('active');

                // Remove recent displayed products
                $('#prodContainer').empty();

                loader();
                generateFilteredProducts(filterIndex.dataset.productIds);
            })
        }
    }

    const clearFilter = () => {
        const filter = document.querySelectorAll('li');

        btnClearFilter.addEventListener('click', () => {
            // Remove class "Active" in all List Item
            for (const removeActiveClass of filter) {
                removeActiveClass.classList.remove('active');
            }

            loader();

            // Remove recent displayed products
            $('#prodContainer').empty();

            getAllProducts(liveRoomID).then(data => {
                generateProductItem(data);

                addToCartModal();
            })
        })
    }

    //* MODAL
    const loopImages = () => {
        const mainImage = document.querySelector('.main-image').firstElementChild;
        const subImage = document.querySelector('.sub-image').children;

        const mainImgSrc = mainImage.src;
        for (const subImgIndex of subImage) {
            subImgIndex.addEventListener('mouseenter', () => {
                const subImgSrc = subImgIndex.src;
                mainImage.src = subImgSrc;
            })

            subImgIndex.addEventListener('mouseleave', () => {
                mainImage.src = mainImgSrc;
            })
        }
    }

    
    const selectedVariety = (data, checkSize) => {
        const colorContainer = document.getElementById('colorContainer');
        const quantitySpan = document.getElementById('basic-addon2');

        let changeColors = [], changeQuantity = 0;
        let color_template = ``;

        const variants = data.variants;
        for (const variantIndex of variants) {
            if (variantIndex.selectedSize === checkSize) {
                changeColors = [...variantIndex.selectedColors];
                changeQuantity = Number(variantIndex.selectedQty);
            }
        }

        for (let colorIndex = 0; colorIndex < changeColors.length; colorIndex++) {
            color_template += `
                <div class="color ${colorIndex === 0 ? 'selected' : ''} "style="background-color:${changeColors[colorIndex]}"></div> 
            `;
        }

        $('#colorContainer').empty();

        colorContainer.insertAdjacentHTML('beforeend', color_template);
        quantitySpan.textContent = `/ ${changeQuantity}`;

        varietiesSelection(data)
    }

    const varietiesSelection = (productData) => {
        const color = document.getElementById('colorContainer').children;
        const size = document.getElementById('sizeContainer').children;

        for (const colorIndex of color) {
            colorIndex.addEventListener('click', () => {
                if (!colorIndex.classList.contains('selected')) {

                    for (const removeClass of color) {
                        removeClass.classList.remove('selected');
                    }
                    colorIndex.classList.add('selected');
                }
            })
        }

        for (const sizeIndex of size) {
            sizeIndex.addEventListener('click', () => {
                if (!sizeIndex.classList.contains('selected')) {
                    
                    for (const removeClass of size) {
                        removeClass.classList.remove('selected');
                    }
                    sizeIndex.classList.add('selected');
                    const changeSize = sizeIndex.textContent.split(' ')[0];

                    selectedVariety(productData, changeSize);
                }
            })
        }
    }

    const addToCartModal = () => {
        const modalButtons = document.querySelectorAll('.addToCart-button');

        for (const btnModal of modalButtons) {
            btnModal.addEventListener('click', () => {
                const prodID = btnModal.dataset.prodId;

                if (modalContainer.hasChildNodes) {
                    $('#dynamicAddToCartModal').empty();
                }

                getProduct(liveRoomID, prodID).then(product => {
                    const generateSubImages = () => {
                        let generate_template = ``;

                        for (let imgIndex = 1; imgIndex < product.productImages.length; imgIndex++) {
                            generate_template += `
                                <img src="data:${product.productImages[imgIndex].type};base64,${product.productImages[imgIndex].data}" alt="${product.prodName}">
                            `;
                        }

                        return generate_template;
                    }

                    const generateUnitType = () => {
                        let generate_template = ``;
                        let totalUnit = 0;

                        // Compute total quantity
                        for (const variant of product.variants) {
                            totalUnit += Number(variant.selectedQty);
                        }

                        generate_template += `
                            <div class="type">
                                <div class="icon unit">
                                    <ion-icon name="checkmark"></ion-icon>
                                    <p>${totalUnit}</p>
                                </div>
                                <p>Available Units</p>
                            </div>
                        `;

                        for (const type of product.prodType) {
                            const typeForClass = type === 'Trending' ? 'trend' :
                                type === 'New Arrival' ? 'new' : 'sale';

                            const typeForIcon = type === 'Trending' ? 'flash' :
                                type === 'New Arrival' ? 'heart' : 'analytics';

                            generate_template += `
                                <div class="type">
                                    <div class="icon ${typeForClass}">
                                        <ion-icon name="${typeForIcon}"></ion-icon>
                                    </div>
                                    <p>${type}</p>
                                </div>
                            `;
                        }

                        return generate_template;
                    }

                    const generateColors = () => {
                        let generate_template = ``;

                        for (let variantIndex = 0; variantIndex < product.variants.length; variantIndex++) {
                            if (variantIndex === 0) {
                                const colors = product.variants[variantIndex].selectedColors;
                                for (const [index, value] of colors.entries()) {
                                    generate_template += `
                                        <div class="color ${index === 0 ? 'selected' : ''} "style="background-color:${value}"></div> 
                                    `;
                                }
                            }
                        }

                        return generate_template;
                    }

                    const generateSizes = () => {
                        let generate_template = ``;

                        for (const [iterator, value] of product.variants.entries()) {
                            generate_template += `
                                <button class="size ${iterator === 0 ? 'selected' : ''}">${value.selectedSize} (${value.selectedQty})</button>
                            `;
                        }

                        return generate_template;
                    }


                    const MODAL_TEMPLATE = `
                        <div class="wrapper">
                            <div class="img-container">
                                <div class="main-image">
                                    <img src="data:${product.productImages[0].type};base64,${product.productImages[0].data}"
                                        alt="${product.prodName}">
                                </div>
                                <div class="sub-image">
                                    ${product.productImages.length > 1 ? generateSubImages() : ''} 
                                </div>
                            </div>
                            <div class="info-container">
                                <p class="product-name">${product.prodName}</p>
                                <p class="product-price">₱<span>${product.prodPrice}</span></p>
                                <p class="product-description">${product.prodDesc}</p>
                                <div class="switch-container">
                                    <div class="switch">
                                        <div class="active">Details</div>
                                        <div>Reviews</div>
                                    </div>
                                    <div class="detail-container">
                                        <div class="unit-type">${generateUnitType()}</div>
                                        <div class="colors">
                                            <p class="title">Colors</p>
                                            <div class="color-container" id="colorContainer">${generateColors()}</div>
                                        </div>
                                        <div class="sizes">
                                            <p class="title">Sizes</p>
                                            <div class="size-container" id="sizeContainer">${generateSizes()}</div>
                                        </div>
                                        <div class="input-group detail-input">
                                            <input type="text" class="form-control" placeholder="Enter quantity">
                                            <div class="input-group-append">
                                            <span class="input-group-text" id="basic-addon2">/ ${product.variants[0].selectedQty}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="review-container" style="display: none"></div>
                                </div>
                            </div>
                        </div>
                    `;

                    modalContainer.insertAdjacentHTML('beforeend', MODAL_TEMPLATE);

                    return product;
                }).then((product) => {
                    loopImages();
                    varietiesSelection(product);
                })

                $('#modalAddToCart').modal('show');
            })
        }

    }


    // Display loader
    loader();

    getAllProducts(liveRoomID).then(data => {
        // Remove loader
        $('#prodContainer').empty();

        generateProductItem(data);
        productFilter(data);

        selectFilter();
        clearFilter();


        addToCartModal();
    })
})