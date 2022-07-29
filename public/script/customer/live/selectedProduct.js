import { firebase } from '../../firebaseConfig.js';
import { getFirestore, doc, collection, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const db = getFirestore(firebase)

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const liveSessionID = urlParams.get('session')

    // Firebase Functions
    const docRef = doc(db, `LiveSession/sessionID_${liveSessionID}`)
    onSnapshot(docRef, doc => {
        displaySelectedProduct(doc.data().currentProductID)
    })

    // Selectors
    const currentProduct = document.querySelector('.product');

    // Functions
    const displaySelectedProduct = async (pid) => {
        const subColRef = doc(db, `LiveSession/sessionID_${liveSessionID}/sessionProducts/${pid}`);
        const subColDoc = await getDoc(subColRef);
        const productData = subColDoc.data();

        const getVariants = () => {
            let VARIANT_TEMPLATE = ``;
            for (const itemIndex of productData.variants) {
                VARIANT_TEMPLATE += `<p class="size">${itemIndex.selectedSize} - ${itemIndex.selectedQty}Pcs</p>`
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
                        <button class="buy">
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
    }




})