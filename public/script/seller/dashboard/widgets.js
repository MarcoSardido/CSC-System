import { getItemsToBeSold, getCustomerRate, getTransactions, getReport, getLiveSummary } from './Api/widgets.js';

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    //? For Weekly Revenue
    const formatDate = (date) => {
        let dd = date.getDate();
        let mm = date.getMonth() + 1;
        let yyyy = date.getFullYear();
        if (dd < 10) { dd = '0' + dd }
        if (mm < 10) { mm = '0' + mm }
        date = yyyy + '-' + mm + '-' + dd
        return date;
    }

    const getLastWeek = () => {
        let result = [];
        for (let i = 7; i > 0; i--) {
            let d = new Date();
            d.setDate(d.getDate() - i);
            result.push(formatDate(d))
        }
        return result
    }

    const getLast7Days = () => {
        let result = [];
        for (let i = 6; 0 <= i; i--) {
            let d = new Date();
            d.setDate(d.getDate() - i);
            result.push({
                x: formatDate(d),
                y: 0
            })
        }
        return result;
    }

    //? Convert 26 Jun 2022 -> 2022-06-26
    const convertStringDateToNumDate = (strDate) => {
        let stringDate = strDate.split(" ");
        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let j = 0; j < months.length; j++) {
            if (stringDate[1] == months[j]) {
                stringDate[1] = months.indexOf(months[j]) + 1;
            }
        }
        if (stringDate[1] < 10) {
            stringDate[1] = '0' + stringDate[1];
        }
        if (stringDate[0] < 10) {
            stringDate[0] = '0' + stringDate[0];
        }
        let result = `${stringDate[2]}-${stringDate[1]}-${stringDate[0]}`;
        return result;
    }

    //? Convert 1800 -> '1,800'
    const checkPriceIsThousands = (price) => {
        return price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    }

    const checkWeeklyRevenue = (data) => {
        const lastWeek = getLastWeek();
        let totalPrice = 0, weeklyRevenue;

        for (const dateIndex of data) {
            const dateFormat = convertStringDateToNumDate(dateIndex.date);
            if (lastWeek.includes(dateFormat)) {
                const priceFormat = dateIndex.price.replace(/\,/g, '');
                const price = Number(priceFormat)
                totalPrice += price;
            }
        }

        weeklyRevenue = checkPriceIsThousands(totalPrice);
        weeklyRevenueLabel.innerText = `₱${weeklyRevenue}`;
    }

    const calculateRating = (data) => {
        const reviewRate = data;
        let s1 = 0, s2 = 0, s3 = 0, s4 = 0, s5 = 0;

        // Cancel computation if no reviews
        if (reviewRate.length === 0) return customerRatingLabel.innerText = `0/5`;

        for (const rateIndex of reviewRate) {
            if (rateIndex === 1) {
                s1++;
            } else if (rateIndex === 2) {
                s2++;
            } else if (rateIndex === 3) {
                s3++;
            } else if (rateIndex === 4) {
                s4++;
            } else if (rateIndex === 5) {
                s5++;
            }
        }
        const starRate = 1*s1+2*s2+3*s3+4*s4+5*s5/(reviewRate.length);
        const formatDecimal = starRate.toFixed(1);

        customerRatingLabel.innerText = `${formatDecimal.split('.')[1] === '0' ? formatDecimal.split('.')[0] : formatDecimal }/5`;
    }

    const recentReports = (data) => {
        let REPORT_TEMPLATE = ``;

        if (data.length > 0) {
            for (const reportIndex of data) {
                REPORT_TEMPLATE += `
                    <div class="report-cont">
                        <div class="userPhoto">
                            <img src="${reportIndex.reportedCustomerPhoto}" alt="${reportIndex.reportedCustomerName}" class="user">
                        </div>
                        <div class="userName">
                            ${reportIndex.reportedCustomerName}
                        </div>
                        <div class="reportDate">
                            ${reportIndex.reportPlaced}
                        </div>
                        <div class="reportType">
                            ${reportIndex.reportType}
                        </div>
                    </div>
                `;
            }

            $('#reportContainer').empty();
            recentReportContainer.insertAdjacentHTML(`beforeend`, REPORT_TEMPLATE);
        }
    }

    const liveSummaryChart = (data) => {
        const transactionChart = document.getElementById("liveStream-chart").getContext('2d');
        new Chart(transactionChart, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Transaction Chart',
                    data: data,
                    fill: true,
                    borderWidth: 3,
                    borderColor: 'rgb(72, 95, 237)',
                    backgroundColor: 'rgb(72, 95, 237, 0.5)',

                    pointBackgroundColor: 'rgb(72, 95, 237)',
                    pointBorderColor: 'rgb(255, 255, 255)',
                    pointBorderWidth: 1,
                    pointHitRadius: 3,

                    tension: 0.3,
                }]
            },
            options: {
                layout: {
                    padding: 20,
                },
                plugins: {
                    title: {
                        display: false
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgb(72, 95, 237, 0.8)',
                        displayColors: false,

                        bodyFont: {
                            size: 15,
                        },
                        callbacks: {
                            label: function (item) {
                                let value = item.raw.y; 7
                                let label = `Total Views: ${value}`;

                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }


    //* Selectors
    const itemsToBeSoldLabel = document.getElementById('lblItemsToBeSold');
    const weeklyRevenueLabel = document.getElementById('lblWeeklyRevenue');
    const totalRevenueLabel = document.getElementById('lblTotalRevenue');
    const itemsSoldLabel = document.getElementById('lblItemsSold');
    const totalCustomersLabel = document.getElementById('lblTotalCustomers');
    const customerRatingLabel = document.getElementById('lblCustomerRating');
    const recentReportContainer = document.getElementById('reportContainer');

    // Items To Be Sold Widget
    getItemsToBeSold(trimmedUID).then(result => {
        itemsToBeSoldLabel.innerText = result.length;
    })

    // Customer Rating Widget
    getCustomerRate(trimmedUID).then(result => {
        calculateRating(result);
    })

    getTransactions(trimmedUID).then(result => {
        // Weekly Revenue Widget
        checkWeeklyRevenue(result.weeklyRevenue);

        // Total Revenue Widget
        totalRevenueLabel.innerText = `₱${checkPriceIsThousands(result.totalRevenue)}`;

        // Items Sold Widget
        itemsSoldLabel.innerText = result.itemsSold.length;

        // Total Customers Widget
        totalCustomersLabel.innerText = result.totalCustomers.length;
    })

    // Recent Reports Widget
    getReport(trimmedUID).then(result => {
        recentReports(result);
    });

    // Recent Live Summary Widget
    getLiveSummary(trimmedUID).then(result => {
        const data = [];
        const week = getLast7Days();

        for (const resultIndex of result) {
            data.push({
                x: convertStringDateToNumDate(resultIndex.date),
                y: resultIndex.totalViewers
            })
        }

        for (let dataIndex = 0; dataIndex < data.length; dataIndex++) {
            for (let weekIndex = 0; weekIndex < week.length; weekIndex++) {
                if (data[dataIndex].x === week[weekIndex].x) {
                    week[weekIndex] = data[dataIndex];
                }
            }
        }

        liveSummaryChart(week);
    })


})