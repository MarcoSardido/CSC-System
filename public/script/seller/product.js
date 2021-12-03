/**
 * Start of JQuery Code
 */

 $(document).ready(()=> {

    // SECTION: Slider to Display Product and Display Add Prodcuts

        $('#slideToAddProduct').click(()=> {
            $('#addProduct_slider').animate({width:"100%"}, 500).find('#slideCont').animate({width:"100%"}, 500);
        });

        $('#closeAddProduct_slider').click(()=> {
            $('#addProduct_slider').animate({width:"0%"}, 500);
        })


    // SECTION: Range Qty, Colors, and Sizes

    $('#addSize').click(()=> {
        $('.addSize-wrapper').addClass('show');
    });

    $('.close').click(()=> {
        $('.addSize-wrapper').removeClass('show');
    })

    $('#slide-range').on('input',() => {
        let newVal = $('#slide-range').val();
        $("#input-quantity").val(newVal);
    });

    $('#input-quantity').on('input',() => {
        $('#slide-range').val($('#input-quantity').val())
    });

    const selected_color = [];
    const color_cont = document.querySelectorAll('.add-color');
    let counter=0;
    $('#color-picker').spectrum({
        type: 'flat',
        allowEmpty: false,
        clickoutFiresChange: false,
        change: function(color) {
            if(counter < color_cont.length) {
                color_cont[counter].style.background = color.toHexString();
                color_cont[counter].classList = 'add-color hasColor';
                selected_color.push(color_cont[counter].style.background = color.toHexString());
                counter++;
                
            } else {
                counter=0;
                color_cont[counter].style.background = color.toHexString();
                color_cont[counter].classList = 'add-color hasColor';
                counter++;
            }     
        },
    });

    let getSelectedSize;
    const getAllSizes = document.querySelectorAll('.sizes');
    for(let i = 0; i < getAllSizes.length; i++) {
        getAllSizes[i].onclick = () => {
            let j = 0;

            while(j < getAllSizes.length) {
                getAllSizes[j++].classList = 'sizes';
            }
            getAllSizes[i].classList = 'sizes selected';
            getSelectedSize = getAllSizes[i].value;
        }
    }

    // $('#input-quantity').val()
    // getSelectedSize
    // selected_color
    const getAllSizesToBeAppended = document.querySelectorAll('.sizesQty');
    const createQtyBadge = document.createElement('div');
    const elementForQty = `
        <div class="badge-cont">
            <span class="badge">${$('#input-quantity').val()}pcs</span>
        </div>
    `;
    createQtyBadge.innerHTML = elementForQty;
    $('.submitSizesAndQty').click(() => {

        for(let checkHasSize = 0; checkHasSize < getAllSizesToBeAppended.length; checkHasSize++) {
            let firstChild = getAllSizesToBeAppended[checkHasSize].children[0];
            let spanTag = firstChild.firstElementChild;

            if (firstChild.classList.contains('hasSize')) {
                console.log('have "hasSize"')
                continue;
            } else {
                // getSizeForAppendedText.appendChild(selectedSizeText);
                // firstChild.children[0].appendChild(selectedSizeText);
                firstChild.classList.add('hasSize');
                spanTag.innerText = getSelectedSize;
                firstChild.append(createQtyBadge)
                // console.log(getSelectedSize)
            }
            break;
        }
    })
   


});

/**
* End of JQuery Code
*/





/**
* Start of JavaScript Code
*/

const mainImgContainer = document.getElementById('mainImg_Cont');
const subImgText = document.getElementById('subImg_Text');
const subImgContainer = document.querySelectorAll('#subImg_Cont');
const productImg = document.getElementsByName('filepondProducts');

const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/PNG'];
const parsedImg = [];
const acceptedImg = [];
document.getElementById('productPreview').addEventListener('click', () => {

    for(let parsedImgLooper = 0; parsedImgLooper < productImg.length; parsedImgLooper++) {
        parsedImg.push(JSON.parse(productImg[parsedImgLooper].value));
    }

    for(let acceptedImgLooper = 0; acceptedImgLooper < parsedImg.length; acceptedImgLooper++) {
        if (imageMimeTypes.includes(parsedImg[acceptedImgLooper].type)) {
            acceptedImg.push(parsedImg[acceptedImgLooper]);
        };
    }

    let mainImg = true;
    let subImgCount = 1;
    let count = 0;
    
    const imgElement = document.createElement('img');
    const sub1ImgElement = document.createElement('img');
    const sub2ImgElement = document.createElement('img');
    const sub3ImgElement = document.createElement('img');
    const sub3PElementText = document.createTextNode("view more");

    const subImgCol = [sub1ImgElement, sub2ImgElement, sub3ImgElement]


    acceptedImg.forEach(key => {
        if (mainImg) {
            imgElement.src = `data:${key.type};base64,${key.data}`;
            imgElement.setAttribute('alt', key.name);
            mainImgContainer.appendChild(imgElement);
            mainImg = false;
            count++;

        } else {
            while(subImgCount === count) {
                if(count-1 == 2) {
                    subImgText.appendChild(sub3PElementText);
                    subImgCol[count-1].src = `data:${key.type};base64,${key.data}`;
                    subImgCol[count-1].setAttribute('alt', key.name);
                    subImgContainer[count-1].appendChild(subImgCol[count-1]);
                    subImgCount++;
                } else {
                    subImgCol[count-1].src = `data:${key.type};base64,${key.data}`;
                    subImgCol[count-1].setAttribute('alt', key.name);
                    subImgContainer[count-1].appendChild(subImgCol[count-1]);
                    subImgCount++;
                };
            };
            count++;
        };
    });
});

const subImg = document.getElementById('subImg_Cont');
const btnBackToProductModal = document.getElementById('closeProductPreview');
btnBackToProductModal.addEventListener('click', () => {
    parsedImg.splice(0, parsedImg.length);
    acceptedImg.splice(0, acceptedImg.length);

    mainImgContainer.removeChild(mainImgContainer.childNodes[0]);

    for(let removeChildLooper = 0; removeChildLooper < subImgContainer.length; removeChildLooper++) {
        if (removeChildLooper == 2) {
            subImgText.innerText = '';
            subImgContainer[removeChildLooper].removeChild(subImgContainer[removeChildLooper].childNodes[3]);

            // while (subImgContainer[removeChildLooper].firstChild) {
            //     subImgContainer[removeChildLooper].removeChild(subImgContainer[removeChildLooper].firstChild);
            // }

        } else {
            subImgContainer[removeChildLooper].removeChild(subImgContainer[removeChildLooper].childNodes[0]);
        };
    };
});


















/**
 *  Add style to the selected size
 *  get the value of selected size and set it to getSelectedSize
 * 
 */
    // const getSize = document.querySelector('.sizes');
    // const getAllSizes = document.querySelectorAll('.sizes');
    // for(let i = 0; i < getAllSizes.length; i++) {
    //     getAllSizes[i].onclick = () => {
    //         let j = 0;

    //         while(j < getAllSizes.length) {
    //             getAllSizes[j++].classList = 'sizes';
    //         }
    //         getAllSizes[i].classList = 'sizes selected';
    //         getSelectedSize = getAllSizes[i].value;
    //     }
    // }




/**
 * @event submitSizeAndQty 
 *  appends the size, and quantity
 */
// const submitSizeAndQty = document.querySelector('.submitSizesAndQty');
// const itemQty = document.querySelector('#input-quantity');
// submitSizeAndQty.onclick = () => {  
//     console.log('size: ',getSelectedSize);
//     console.log('QTY: ',itemQty.value);
//     console.log(selected_color)
// }




// const colors_cont = [];
// const colors = document.querySelectorAll('#select-color');
// let indexRemove=0;

// for (let i=0; i<colors.length; i++) {
//     colors[i].onclick = () => {

//         if (colors_cont.length <5) {
//             colors_cont.push(colors[i].value);

//         } else {

//             if (indexRemove < 5) {
//                 colors_cont.splice(indexRemove,1);
//                 colors_cont.splice(indexRemove,0,colors[i].value);
//                 indexRemove++;
//             } else {
//                 indexRemove=0;
//                 colors_cont.splice(indexRemove,1);
//                 colors_cont.splice(indexRemove,0,colors[i].value);
//                 indexRemove++;
//             };
//         };
        
//         console.log(colors_cont)
//     };
// }

/**
* End of JavaScript Code
*/