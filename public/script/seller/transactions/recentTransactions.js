import {
    dataForRecentTransactions,
} from './Api/getTransactions.js';

$(document).ready(() => {

    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    dataForRecentTransactions(trimmedUID).then(({ recentTransContainer, stripeSubs }) => {
        addTransactionList(recentTransContainer, stripeSubs)
    })

    const addTransactionList = (transaction, subscription) => {
        const list = document.querySelector('.list-cont');
        const listContent = transactionItemContent(transaction, subscription);
        list.insertAdjacentHTML('beforeend', listContent);
    }

    const transactionItemContent = (transItem, subsItem) => {
        let itemContent = ``;

        for (let itemIndex = 0; itemIndex < transItem.length; itemIndex++) {
            itemContent += `
                <div class="item-sold">
                    <div class="item-img">
                        <ion-icon name="bag-check-outline"></ion-icon>
                    </div>
                    <div class="item-detail">
                        ${transItem[itemIndex].customerName}
                        <p>${transItem[itemIndex].date}</p>
                    </div>
                    <div class="item-amount" ${transItem[itemIndex].status === 'Success' ? 'style="color: #20bf55"' : 'style="color: #ffcc2f"'}>
                        ${transItem[itemIndex].status === 'Success' ? '+' : '~'} ₱${transItem[itemIndex].totalPrice}
                    </div>
                </div>
            `;
        }

        itemContent += `
            <div class="item-sold">
                <div class="item-img">
                    <ion-icon name="checkmark-circle-outline"></ion-icon>
                </div>
                <div class="item-detail">
                    Subscription <span>(${subsItem.subscriptionType})</span>
                    <p>${subsItem.subscriptionDate}</p>
                </div>
                <div class="item-amount" style="color:#e50914">
                    - ₱${subsItem.subscriptionPrice.toLocaleString()}
                </div>
            </div>
        `;

        return itemContent;
    }

});