import {
    dataForAnalytics,
} from './Api/getTransactions.js'

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    dataForAnalytics(trimmedUID).then(res => {
        const data = [];
        const week = getLast7Days();

        for (const iterator of res) {
            let amount = iterator.totalPrice;
            amount = amount.replace(/[^\d\.]/g, "");
            amount = parseFloat(amount);

            data.push({
                x: convertStringDateToNumDate(iterator.date),
                y: amount,
            })
        }

       

        for (let dataIndex = 0; dataIndex < data.length; dataIndex++) {
            for (let weekIndex = 0; weekIndex < week.length; weekIndex++) {

                if (data[dataIndex].x === week[weekIndex].x) {
                    week[weekIndex] = data[dataIndex];
                }
            }
        }

        return { week, res };
    }).then(({ week, res }) => {
        if (res.length === 0) {
            loadChart(getLast7Days())
        }
        loadChart(week)
    })

    // Get last week days
    const formatDate = (date) => {
        let dd = date.getDate();
        let mm = date.getMonth() + 1;
        let yyyy = date.getFullYear();
        if (dd < 10) { dd = '0' + dd }
        if (mm < 10) { mm = '0' + mm }
        date = yyyy + '-' + mm + '-' + dd
        return date;
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

    //! To be used in user transaction page
    // Result: 01 Jul 2022
    const stringDateFormat = () => {
        const date = new Date();
        const formattedDate = date.toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        }).replace(/ /g, ' ');
        return formattedDate;
    }

    // Result: 01 Jul 2022 -> 2022-07-01
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


    //  Chart
    const loadChart = (data) => {
        const transactionChart = document.getElementById("transaction-chart").getContext('2d');
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
                                let value = item.raw.y;

                                value = value.toLocaleString();
                                let label = `You've Earned ₱${value}`

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

})