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
        $('#tableData-transact').css('min-height','275px');
    }
    
    const tableDataOptions = (data) => {
        const dropDown = document.querySelectorAll('.dropright');
        for (const [index, value] of dropDown.entries()) {

            const menuContent = `
                <button type="button" class="btn-popover" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    ...
                </button>
                <div class="dropdown-menu tbl-dropdown">
                    <a class="dropdown-item" href="#" data-toggle="modal" data-target="#staticBackdrop" data-trans-id="${data[index].transactionID}">More Info</a>
                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item tblMenu-report" href="#" data-toggle="modal" data-target="#staticBackdrop">Report</a>
                    <a class="dropdown-item tblMenu-delete" href="#" data-toggle="modal" data-target="#staticBackdrop">Delete</a>
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


    getAllTransactionRecords(trimmedUID).then(res => {
        loadData(res)
        tableDataOptions(res)
    })
})