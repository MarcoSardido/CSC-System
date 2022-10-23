$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    //* ============================== Global Selectors ============================== *// 
    let main = document.querySelector(".main"); btnSubmitReview
    // :: Modal
    const MODAL_REVIEW_CLOSE_BUTTON = document.getElementById('btnCloseReviewModal');
    const MODAL_REVIEW_SUBMIT_BUTTON = document.getElementById('btnSubmitReview');
    const reviewFilterAllContainer = document.getElementById('reviewFilterAll');
    const reviewFilterHistoryContainer = document.getElementById('reviewFilterHistory');
    const MODAL_REVIEW_ITEM = document.getElementById('reviewModalItem');
    const MODAL_STARS = document.querySelectorAll('[name="stars"]');
    const MODAL_FEEDBACK = document.getElementById('txtFeedBack');


    //* ============================== Get All Reviews ============================== *// 
    MODAL_REVIEW_CLOSE_BUTTON.addEventListener('click', () => {
        main.classList.remove("active");
    })

    MODAL_REVIEW_SUBMIT_BUTTON.addEventListener('click', () => {
        const reviewID = document.getElementById('reviewID').textContent;
        submitReviewRate(reviewID)

    })

    // :: Generate review template
    const reviewItem = (reviewData) => {

        //* Review Filter: ALL 
        let review_all_template = ``;

        //* Review Filter: HISTORY
        let review_history_template = ``;

        for (const reviewIndex of reviewData) {
            if (reviewIndex.rate === 0 && reviewIndex.feedBack === '') {
                const loopItems = () => {
                    let items_template = ``;
    
                    for (const itemIndex of reviewIndex.products) {
                        items_template += `
                            <div class="item-content">
                                <div class="item">
                                    <img src="${itemIndex.image}">
                                    <div class="item-name">
                                        <h2 style="font-weight: 400">${itemIndex.name}</h2>
                                        <p class="text-muted">${itemIndex.description}</p>
                                        <p class="text-muted">Color: ${itemIndex.color} | Size: ${itemIndex.size}</p>
                                    </div>
                                </div>
                                <div class="item-qty">
                                    <h2 style="font-weight: 400">Qty: ${itemIndex.quantity}</h2>
                                </div>
                            </div>
                        `;
                    }
    
                    return items_template;
                }

                review_all_template += `
                    <div class="order">
                        <div class="top">
                            <div class="shop">
                                <ion-icon name="storefront-outline"></ion-icon>
                                <b style="font-size: 0.85rem">${reviewIndex.storeName}</b>
                            </div>
                            <div class="status">
                                <ion-icon name="cube-outline" class="text-muted"></ion-icon>
                                <div class="text-muted">Delivered on: <b id="dateDelivered">${reviewIndex.deliveredOn}</b></div>
                            </div>

                        </div>

                        <hr size="3" style="width: 86%; margin: auto; background-color: #7d8da1;">

                        <div class="middle">${loopItems()}</div>

                        <hr size="3" style="background-color: #7d8da1;">

                        <div class="btn-group">
                            <button class="active modal-btn" id="btnRateItem" data-review-id="${reviewIndex.reviewID}">Rate</button>
                        </div>

                    </div>
                `;

            } else {
                const loopItems = () => {
                    let items_template = ``;
    
                    for (const itemIndex of reviewIndex.products) {
                        items_template += `
                            <div class="item-content">
                                <div class="item">
                                    <img src="${itemIndex.image}">
                                    <div class="item-name">
                                        <h2 style="font-weight: 400">${itemIndex.name}</h2>
                                        <p class="text-muted">${itemIndex.description}</p>
                                        <p class="text-muted">Color: ${itemIndex.color} | Size: ${itemIndex.size}</p>
                                    </div>
                                </div>
                                <div class="item-qty">
                                    <h2 style="font-weight: 400">Qty: ${itemIndex.quantity}</h2>
                                </div>
                                <div class="item-price">
                                    <h2>${convertIntoWholeNumber(itemIndex.subTotal)}</h2>
                                </div>
                            </div>
                        `;
                    }
    
                    return items_template;
                }

                review_history_template += `
                    <div class="order">
                        <div class="top">
                            <div class="shop">
                                <ion-icon name="storefront-outline"></ion-icon>
                                <b style="font-size: 0.85rem">Apple Accessories Store</b>
                            </div>
                            <div class="status">
                                <ion-icon name="star-outline" class="text-muted"></ion-icon>
                                <p style="color: var(--color-primary); font-size: 1rem">RATED</p>
                            </div>
                        </div>

                        <hr size="3" style="width: 86%; margin: auto; background-color: #7d8da1;">

                        <div class="middle">${loopItems()}</div>
                        <br>
                    </div>
                `;
            }
           
        }
        reviewFilterAllContainer.insertAdjacentHTML('beforeend', review_all_template);
        reviewFilterHistoryContainer.insertAdjacentHTML('beforeend', review_history_template);

        const allRateButtons = document.querySelectorAll('#btnRateItem');
        for (const btnIndex of allRateButtons) {
            btnIndex.addEventListener('click', () => {
                const reviewID = btnIndex.dataset.reviewId;
                reviewModal(reviewData, reviewID);
                main.classList.add("active");
            })
        }
    }

    //? Api 
    fetch(`/customercenter/reviews/${trimmedUID}/getAllReview`).then(res => {
        if (res.ok) return res.json();
    }).then(data => {
        reviewItem(data);
    }).catch(err => {
        console.error(`Fetch API Error: ${err.message}`)
    });


    //* ============================== Review Modal ============================== *//
    const reviewModal = (reviewData, reviewID) => {
        const itemObj = {};

        for (const reviewIndex of reviewData) {
            if (reviewIndex.reviewID === reviewID) {
                itemObj.id = reviewIndex.reviewID;
                itemObj.image = reviewIndex.products[0].image;
                itemObj.name = reviewIndex.products[0].name;
                itemObj.color = reviewIndex.products[0].color;
            }
        }

        const ITEM_TEMPLATE = `
            <p id="reviewID" hidden>${itemObj.id}</p>
            <img src="${itemObj.image}">
            <div class="item-details">
                <h2 style="font-weight: 500" id="order-name">${itemObj.name}</h2>
                <p class="text-muted" id="order-variation">Color: ${itemObj.color}</p>
            </div>
        `;

        $('#reviewModalItem').empty();
        MODAL_REVIEW_ITEM.insertAdjacentHTML('beforeend', ITEM_TEMPLATE)
    }

    const submitReviewRate = (id) => {
        const reviewSubmitObj = {};

        for (const rateIndex of MODAL_STARS) {
            if (rateIndex.checked) {
                reviewSubmitObj.rate = Number(rateIndex.value);
            }
        }
        reviewSubmitObj.reviewID = id;
        reviewSubmitObj.feedBack = MODAL_FEEDBACK.value;

        fetch('/customercenter/reviews/addReview', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                uid: trimmedUID,
                reviewData: reviewSubmitObj
            })
        }).then(res => {
            if (res.ok) {
                main.classList.remove("active");
                return Swal.fire({
                    icon: 'success',
                    title: 'Rated Successfully',
                    text: 'Thank you for purchasing this product',
                    timer: 3000,
                    showCancelButton: false,
                    showConfirmButton: false
                }).then(() => {
                    window.location.reload();
                })
            }
        })

    }



    /**
     * ?Converts cents into whole number with currency symbol
     * @param price 30000
     * @returns ₱300.00
     */
     const convertIntoWholeNumber = (price) => {
        return (price / 100).toLocaleString("en-US", { style: "currency", currency: "PHP" })
    }
})