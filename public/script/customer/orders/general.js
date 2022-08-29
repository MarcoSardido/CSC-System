import { getAllOrders } from './Api/getOrders.js';

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();
    
    //* =====================================================================================
    // ==================================== Global Selectors ================================
    //* =====================================================================================
    const allOrderContainer = document.querySelector('.all-order-list');
    const processingOrderContainer = document.querySelector('.processing-order-list');
    const shippedOrderContainer = document.querySelector('.shipped-order-list');
    const deliveredOrderContainer = document.querySelector('.delivered-order-list');


    //* =====================================================================================
    // ======================================= Functions ====================================
    //* =====================================================================================

    const generateOrderItem = (data) => {
        let filterAll = ``, filterProcess = ``, filterShipped = ``, filterDelivered = ``;

        for (const orderIndex of data) {
            const checkStatusLabel = orderIndex.status === 'Shipped' ? 'Item has been shipped' :
                                     orderIndex.status === 'Delivered' ? 'Item has been delivered' :
                                     'Order Placed';

            //! Order Filter: All
            filterAll += `
                <div class="order">
                    <div class="top">
                        <div class="shop">
                            <ion-icon name="storefront-outline"></ion-icon>
                            <b style="font-size: 0.85rem">${orderIndex.seller.storeName}</b>
                        </div>
                        <div class="status">
                            <ion-icon name="rocket-outline" class="text-muted"></ion-icon>
                            <div class="text-muted">${checkStatusLabel}</div> |
                            <b style="color: #ff7782">${orderIndex.status}</b>
                        </div>
                    </div>
                    <hr size="3" style="width: 86%; margin: auto; background-color: #7d8da1;">
                    <div class="middle">
                        ${loopOrderItems(orderIndex.items)}
                    </div>
                    <hr size="3" style="background-color: #7d8da1;">
                    <div class="btn-group">
                        <a href="orders/orderstatus?id=${orderIndex.id}" class="active">Check Status</a>
                    </div>
                </div>
            `;

            //! Order Filter: Processing
            if (orderIndex.status === 'Processing') {
                filterProcess += `
                    <div class="order">
                        <div class="top">
                            <div class="shop">
                                <ion-icon name="storefront-outline"></ion-icon>
                                <b style="font-size: 0.85rem">${orderIndex.seller.storeName}</b>
                            </div>
                            <div class="status">
                                <ion-icon name="rocket-outline" class="text-muted"></ion-icon>
                                <div class="text-muted">${checkStatusLabel}</div> |
                                <b style="color: #ff7782">${orderIndex.status}</b>
                            </div>
                        </div>
                        <hr size="3" style="width: 86%; margin: auto; background-color: #7d8da1;">
                        <div class="middle">
                            ${loopOrderItems(orderIndex.items)}
                        </div>
                        <hr size="3" style="background-color: #7d8da1;">
                        <div class="btn-group">
                            <a href="orderStatus.html" class="active" data-order-id="${orderIndex.id}">Check Status</a>
                        </div>
                    </div>
                `;
            }

            //! Order Filter: Shipped
            if (orderIndex.status === 'Shipped') {
                filterShipped += `
                    <div class="order">
                        <div class="top">
                            <div class="shop">
                                <ion-icon name="storefront-outline"></ion-icon>
                                <b style="font-size: 0.85rem">${orderIndex.seller.storeName}</b>
                            </div>
                            <div class="status">
                                <ion-icon name="rocket-outline" class="text-muted"></ion-icon>
                                <div class="text-muted">${checkStatusLabel}</div> |
                                <b style="color: #ff7782">${orderIndex.status}</b>
                            </div>
                        </div>
                        <hr size="3" style="width: 86%; margin: auto; background-color: #7d8da1;">
                        <div class="middle">
                            ${loopOrderItems(orderIndex.items)}
                        </div>
                        <hr size="3" style="background-color: #7d8da1;">
                        <div class="btn-group">
                            <a href="orderStatus.html" class="active" data-order-id="${orderIndex.id}">Check Status</a>
                        </div>
                    </div>
                `;
            }

            //! Order Filter: Delivered
            if (orderIndex.status === 'Delivered') {
                filterDelivered += `
                    <div class="order">
                        <div class="top">
                            <div class="shop">
                                <ion-icon name="storefront-outline"></ion-icon>
                                <b style="font-size: 0.85rem">${orderIndex.seller.storeName}</b>
                            </div>
                            <div class="status">
                                <ion-icon name="rocket-outline" class="text-muted"></ion-icon>
                                <div class="text-muted">${checkStatusLabel}</div> |
                                <b style="color: #ff7782">${orderIndex.status}</b>
                            </div>
                        </div>
                        <hr size="3" style="width: 86%; margin: auto; background-color: #7d8da1;">
                        <div class="middle">
                            ${loopOrderItems(orderIndex.items)}
                        </div>
                        <hr size="3" style="background-color: #7d8da1;">
                        <div class="btn-group">
                            <a href="orderStatus.html" class="active" data-order-id="${orderIndex.id}">Check Status</a>
                        </div>
                    </div>
                `;
            }
        }

        allOrderContainer.insertAdjacentHTML('beforeend', filterAll)
        processingOrderContainer.insertAdjacentHTML('beforeend', filterProcess)
        shippedOrderContainer.insertAdjacentHTML('beforeend', filterShipped)
        deliveredOrderContainer.insertAdjacentHTML('beforeend', filterDelivered)
    }

    const loopOrderItems = (items) => {
        let allItems = ``;

        for (const itemIndex of items) {
            allItems += `
                <div class="item-content">
                    <div class="item">
                        <img src="${itemIndex.image}">
                        <div class="item-name">
                            <h2 style="font-weight: 400">${itemIndex.name}</h2>
                            <p class="text-muted">${itemIndex.description}</p>
                            <p class="text-muted">Color: ${convertRgbToText(itemIndex.color)} | Size: ${itemIndex.size}</p>
                        </div>
                    </div>
                    <div class="item-qty">
                        <h2 style="font-weight: 400">Qty: ${itemIndex.quantity}</h2>
                    </div>
                    <div class="item-price">
                        <h2>₱${formatThousands(itemIndex.subTotal / 100)}.00</h2>
                    </div>
                </div>
            `;
        }

        return allItems;
    }

    const rgbToHex = (r, g, b) => {
        let rgb = b | (g << 8) | (r << 16);
        return (0x1000000 | rgb).toString(16).substring(1);
    }

    const convertRgbToText = (color) => {
        // Breakdown rbg color
        let getComponent = color.substring(4, color.length - 1).replace(/ /g, '').split(',');
        let hexValue = rgbToHex(getComponent[0], getComponent[1], getComponent[2])

        //? Library that converts HEX to Color Name
        const nameValue = ntc.name(hexValue)[1];

        return nameValue;
    }

    const formatThousands = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }


    //* =====================================================================================
    // ======================================== API Call ====================================
    //* =====================================================================================

    getAllOrders(trimmedUID).then(result => {
        //? Generate Dynamic Order Item
        generateOrderItem(result);
    })

})