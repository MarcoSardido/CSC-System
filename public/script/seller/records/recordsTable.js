import {
    getAllReportId,
} from './Api/getReports.js'

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    getAllReportId(trimmedUID).then(res => {
        console.log(res)
        loadTableData(res)
        tableDataOptions(res);
        modalData(res);
    })

    const loadTableData = (data) => {
        const tableSize = data.length <= 10 ? data.length : 10;
        $('#tableData-report').DataTable({
            data: data,
            columns: [
                { data: 'ticketID' },
                { data: 'complainantName' },
                { data: 'reportType' },
                { data: 'date' },
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
            "lengthMenu": [[tableSize], [tableSize]],
        });
    }

    const tableDataOptions = (data) => {
        const dropDown = document.querySelectorAll('.dropright');
        for (const [index, value] of dropDown.entries()) {

            const menuContent = `
                <button type="button" class="btn-popover" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    ...
                </button>
                <div class="dropdown-menu tbl-dropdown">
                    <a class="dropdown-item viewRecordModal" data-toggle="modal" data-target="#viewReportModal" data-trans-id="${data[index].ticketID}">More Info</a>
                </div>
            `;

            value.insertAdjacentHTML('beforeend', menuContent)
        }

        const status = document.querySelectorAll('.status');
        for (const [index, value] of status.entries()) {
            const statusNode = document.createTextNode(data[index].status);
            let status = (data[index].status == 'Done') ? 'success' : 'pending';

            value.classList.add(`status-${status}`)
            value.appendChild(statusNode);
        }
    }

    const modalData = (data) => {
        const viewModal = document.querySelectorAll('.viewRecordModal');
        const modalBodyContainer = document.querySelector('.report-content');

        for (const modalIndex of viewModal) {
            modalIndex.addEventListener('click', () => {
                const indexTicketID = modalIndex.dataset.transId;

                for (const dataIndex of data) {
                    if (dataIndex.ticketID === indexTicketID) {

                        let reportBodyData = `
                            ${headerContent(dataIndex)} 
                            ${bodyContent(dataIndex)}
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary btnViewItemClose" data-dismiss="modal">Close</button>
                            </div>
                        `;

                        modalBodyContainer.insertAdjacentHTML('beforeend', reportBodyData);

                    }
                }
                
            })
            
        }


    }

    const headerContent = (data) => {
        return `
            <div class="modal-header">
                <div class="title-bar">
                    <h5 class="main-title" id="staticBackdropLabel">Report Ticket ID# ${data.ticketID}</h5>
                    <h5 class="sub-title">Offense: <span>${data.reportType}</span></h5>
                </div>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `;
    }

    const bodyContent = (data) => {
        const punishment = data.punishment === 'Banned' ? 'ban' : 'mute';

        return `
            <div class="modal-body report-modal-body">
                <p class="header-text">
                    ${data.punishmentMessage}
                </p>
                <p class="body-text">
                    You have been reported by ${data.complainantName} because of Scamming on your last live selling session.
                    As punishment of your actions the team decided to ${punishment} you from live selling for ${data.daysBanned} days.
                </p>
                <p class="footer-text">
                    City Sales Cloud Team.
                </p>
            </div>
        `;
    }
});