import {
    getAllTransactionRecords,
} from './Api/getTransactions.js'

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    const loadData = (data) => {
        $('#tableData-transact').DataTable({
            data: data,
            columns: [
                { data: 'date' },
                { data: 'customer.displayName' },
                { data: 'payment' },
                { data: 'totalPrice' },
                {
                    "render": function () {
                        return $('<div>')
                            .attr('class', 'status')
                            .wrap('<div></div>')
                            .parent()
                            .html();
                    }
                },
                {
                    "render": function () {
                        return $('<div>')
                            .attr('class', 'btn-group dropright')
                            .wrap('<div></div>')
                            .parent()
                            .html();
                    }
                }
            ],
            "lengthMenu": [[5], [5]],
        });
        $('#tableData-transact').css('min-height', '275px');
    }

    const tableDataOptions = (data) => {
        const dropDown = document.querySelectorAll('.dropright');
        for (const [index, value] of dropDown.entries()) {

            const menuContent = `
                <button type="button" class="btn-popover" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    ...
                </button>
                <div class="dropdown-menu tbl-dropdown">
                    <a class="dropdown-item viewRecordModal" data-toggle="modal" data-target="#staticBackdrop" data-trans-id="${data[index].transactionID}">More Info</a>
                </div>
            `;

            value.insertAdjacentHTML('beforeend', menuContent)
        }

        const status = document.querySelectorAll('.status');
        for (const [index, value] of status.entries()) {
            const statusNode = document.createTextNode(data[index].status);
            let status = (data[index].status == 'Success') ? 'success' : 'pending';

            value.classList.add(`status-${status}`)
            value.appendChild(statusNode);
        }
    }

    const viewRecord = (data) => {
        const viewModal = document.querySelectorAll('.viewRecordModal');
        for (const modalIndex of viewModal) {
            modalIndex.addEventListener('click', () => {
                const transID = modalIndex.dataset.transId;
                for (const recordIndex of data) {
                    if (recordIndex.transactionID === transID) {
                        displayModalData(recordIndex)
                    }
                }
            })
        }
    }

    const displayModalData = (data) => {
        const modalBody = document.querySelector('.modal-body');

        if (modalBody.children.length !== 0) {
            modalBody.innerHTML = "";
        }

        const address = data.customer.address;
        const split = address.split(',');
        const firstAddress = split.splice(0, 1).toString().trim();
        const secondAddress = split.join(',').trim();

        const dataContent = `
            <div class="client-info">
                <div class="bill-info">
                    <p class="modal-static-text">Billed To</p>
                    <p class="modal-dynamic-text">
                        <p class="bill-client">${data.customer.fullName}</p>
                        <p class="bill-street">${firstAddress}</p>
                        <p class="bill-address">${secondAddress}</p>
                    </p>
                </div>
                <div class="invoice-info">
                    <p class="modal-static-text">Invoice Details</p>
                    <p class="modal-dynamic-text">
                    <p class="invoice invoice-num"># ${data.transactionID}</p>
                    <p class="invoice invoice-date">Date: ${data.date}</p>
                    <p class="invoice invoice-mode">Mode of Payment: ${data.payment}</p>
                    </p>
                </div>
            </div>
            <hr>
            <div class="product-info-table">
                <table class="table table-borderless tbl-modal">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Unit Cost</th>
                            <th>Qty</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${loopEachItem(data.items)}
                    </tbody>
                </table>
            </div>
            <hr>
            <div class="footer">
                <div class="subTotal-row">
                    <div class="static-column">
                        <p>Subtotal</p>
                        <p>Sales tax</p>
                        <p>Shipping</p>
                    </div>
                    <div class="dynamic-column">
                        <p>${data.totalPrice}</p>
                        <p>0.00</p>
                        <p>0.00</p>
                    </div>
                </div>
                <hr>
                <div class="total-row">
                    <div class="static-column">
                        <p><strong>Total</strong></p>
                    </div>
                    <div class="dynamic-column">
                        <p><strong>₱${data.totalPrice}</strong></p>
                    </div>
                </div>
            </div>
        `;

        modalBody.insertAdjacentHTML('beforeend', dataContent)

    }

    const loopEachItem = (items) => {
        let itemContent = ``;

        for (const itemIndex in items) {

            itemContent += `
                <tr>
                    <td>
                        <div class="tbl-product-details">
                            <strong>${items[itemIndex].name}</strong>
                                <p class="modal-static-text">${items[itemIndex].description}</p>
                            </div>
                    </td>
                    <td class="strong">₱${items[itemIndex].price}</td>
                    <td class="strong">${items[itemIndex].quantity}</td>
                    <td class="strong">₱${items[itemIndex].subTotal}</td>
                </tr> 
            `;
        }
        return itemContent;

    }

    const clearUpModal = () => {
        const closeModal = document.querySelector('.btnViewItemClose');

        closeModal.addEventListener('click', () => {
            console.log('clicked')
        })
    }


    getAllTransactionRecords(trimmedUID).then(res => {
        loadData(res)
        tableDataOptions(res)
        viewRecord(res)
        // clearUpModal();
    })
})