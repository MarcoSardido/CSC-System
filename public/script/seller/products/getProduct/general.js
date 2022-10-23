$(document).ready(() => {
    
    //* ==================================== Global Selectors ===================================== *//
    const editProductSection = document.querySelector('.editProductButton');
    const btnSaveEditedProduct = document.getElementById('btnSaveEditProduct')

    // switch left
    const displayImg = document.getElementById('switchImg');
    const editImg = document.getElementById('switchEditImg');

    // switch right
    const reviewContainer = document.querySelector('.review-container');
    const varietyContainer = document.querySelector('.product-variety');

    // switch buttons
    const displayButtonContainer = document.getElementById('switchDisplayButton');
    const editButtonContainer = document.getElementById('switchEditButtons');
    const btnCancelEditProduct = document.getElementById('btnCancelEditProduct')

    // input container
    const inputContainer = document.querySelector('.displayDetails');
    const inputArray = inputContainer.querySelectorAll('input, textarea');

    // Switch to edit mode
    editProductSection.addEventListener('click', () => {
        // right
        reviewContainer.style.display = 'none';
        varietyContainer.style.display = 'block';
        // left
        displayImg.style.display = 'none';
        editImg.style.display = 'block';

        // buttons
        displayButtonContainer.style.display = 'none';
        editButtonContainer.style.display = 'block';

        // inputs
        for (const inputIndex of inputArray) {
            inputIndex.removeAttribute('disabled')
        }
    })

    btnCancelEditProduct.addEventListener('click', () => {
        // right
        reviewContainer.style.display = 'block';
        varietyContainer.style.display = 'none';
        // left
        displayImg.style.display = 'block';
        editImg.style.display = 'none';

        // buttons
        displayButtonContainer.style.display = 'block';
        editButtonContainer.style.display = 'none';

        // inputs
        for (const inputIndex of inputArray) {
            inputIndex.setAttribute('disabled', "")
        }
    })

    //! ================================= Functions for product editing ================================= !//

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




})