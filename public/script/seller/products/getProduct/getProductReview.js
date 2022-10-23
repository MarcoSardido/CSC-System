$(document).ready(() => {

    const uuid = $('#uid').text().trim();
    const currentURL = window.location.href;
    const productID = currentURL.split('/')[currentURL.split('/').length - 1];

    //* ============================== Global Selectors ==================================== *//
    const reviewContainer = document.getElementById('dynamicReviewContainer');
    const emptyText = document.getElementById('defaultTitle');


    const loopStarForRate = (rateData) => {
        let rateTemplate = ``;

        for (let rateIndex = 0; rateIndex < rateData; rateIndex++) {
            rateTemplate += `<ion-icon name="star"></ion-icon>`;
        }

        return rateTemplate;
    }

    const generateReview = (reviewData) => {
        for (const reviewIndex of reviewData) {
            const REVIEW_TEMPLATE = `
                <div class="review">
                    <div class="top">
                        <div class="image">
                            <img src="${reviewIndex.customer.picture}" alt="${reviewIndex.customer.displayName}" />
                        </div>
                        <div class="info">
                            <div class="name">${reviewIndex.customer.displayName}</div>
                            <div class="rate-container">
                                ${loopStarForRate(reviewIndex.rate)}
                                <div class="rate">${reviewIndex.rate}.0</div>
                            </div>
                        </div>
                        <div class="date">${reviewIndex.dateReviewed}</div>
                    </div>
                    <div class="bottom">${reviewIndex.feedBack}</div>
                </div>
            `;

            emptyText ? $('#defaultTitle').remove() : '';
            reviewContainer.insertAdjacentHTML('beforeend', REVIEW_TEMPLATE)
        }
    }
    

    //* ================================== Fetch APIs ====================================== *//
    const getReview = async () => {
        const reviewsResult = await fetch(`/sellercenter/products/${productID}/reviews`);
        const reviewData = await reviewsResult.json();

        generateReview(reviewData);
    }

    getReview();
})