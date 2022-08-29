import { getOrdersToBeReviewed, getAllReviewedOrders } from './Api/review.js';

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    getOrdersToBeReviewed(trimmedUID);
    getAllReviewedOrders(trimmedUID);
})