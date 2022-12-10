import {
    dataForAnalytics,
} from './Api/getTransactions.js'

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    dataForAnalytics(trimmedUID).then(res => {
        const dayData = [], weekData = [], monthData = [];
        const day = get7Days();
        const week = getLast7Days();
        const month = getMonths();
        let addAmount = 0;

        // Week
        for (let index1 = 0; index1 < res.length; index1++) {
            for (let index2 = index1 + 1; index2 < res.length; index2++) {
                if (res[index1].date == res[index2].date) {

                    // Check and format price if has ","
                    let formatPrice1 = res[index1].totalPrice.replaceAll(',', '');
                    let formatPrice2 = res[index2].totalPrice.replaceAll(',', '');
                    let price1 = Number(formatPrice1)
                    let price2 = Number(formatPrice2)
                    addAmount = price1 + price2;

                    res[index2].totalPrice = addAmount.toString();
                    res.splice(index1, 1);
                }
            }
        }

        for (const iterator of res) {
            let formatPrice = iterator.totalPrice;

            dayData.push({
                x: convertStringDateToNumDate(iterator.date),
                y: Number(formatPrice),
            })

            weekData.push({
                x: convertStringDateToNumDate(iterator.date),
                y: Number(formatPrice),
            })


            monthData.push({
                x: convertStringDateToNumDate(iterator.date),
                y: Number(formatPrice)
            })
        }

        console.log(weekData)
        console.log(week)

        for (let dataDayIndex = 0; dataDayIndex < dayData.length; dataDayIndex++) {
            for (let dayIndex = 0; dayIndex < day.length; dayIndex++) {

                if (dayData[dataDayIndex].x === day[dayIndex].x) {
                    day[dayIndex] = dayData[dataDayIndex];
                }
            }
        }

        for (let dataWeekIndex = 0; dataWeekIndex < weekData.length; dataWeekIndex++) {
            for (let weekIndex = 0; weekIndex < week.length; weekIndex++) {

                if (weekData[dataWeekIndex].x === week[weekIndex].x) {
                    week[weekIndex] = weekData[dataWeekIndex];
                }
            }
        }

        

        for (let removeDayIndex = 0; removeDayIndex < monthData.length; removeDayIndex++) {
            const split = monthData[removeDayIndex].x.split('-');
            split.splice(2, 1)
            monthData[removeDayIndex].x = split.join('-')
        }

        for (let monthDataIndex1 = 0; monthDataIndex1 < monthData.length; monthDataIndex1++) {
            for (let monthDataIndex2 = monthDataIndex1 + 1; monthDataIndex2 < monthData.length; monthDataIndex2++) {

                if (monthData[monthDataIndex1].x === monthData[monthDataIndex2].x) {
                    monthData[monthDataIndex2].y += monthData[monthDataIndex1].y;
                    monthData[monthDataIndex1].y = 0;
                }
            }
        }

        for (let dataMonthIndex = 0; dataMonthIndex < monthData.length; dataMonthIndex++) {
            for (let monthIndex = 0; monthIndex < month.length; monthIndex++) {

                if (monthData[dataMonthIndex].x === month[monthIndex].x) {
                    if (monthData[dataMonthIndex].y !== 0) {
                        month[monthIndex].y = monthData[dataMonthIndex].y;
                    }
                }
            }
        }

        return { day, week, month };
    }).then(({ day, week, month }) => {
        checkChartOption(day, week, month);
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

    const get7Days = () => {
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

    const getLast7Days = () => {
        let result = [];
        for (let i = 7; 0 < i; i--) {
            let d = new Date();
            d.setDate(d.getDate() - i);
            result.push({
                x: formatDate(d),
                y: 0
            })
        }
        return result;
    }

    const getMonths = () => {
        const d = new Date();
        const currentYear = d.getFullYear();
        const month = [
            { x: `${currentYear}-01`, y: 0 },
            { x: `${currentYear}-02`, y: 0 },
            { x: `${currentYear}-03`, y: 0 },
            { x: `${currentYear}-04`, y: 0 },
            { x: `${currentYear}-05`, y: 0 },
            { x: `${currentYear}-06`, y: 0 },
            { x: `${currentYear}-07`, y: 0 },
            { x: `${currentYear}-08`, y: 0 },
            { x: `${currentYear}-09`, y: 0 },
            { x: `${currentYear}-10`, y: 0 },
            { x: `${currentYear}-11`, y: 0 },
            { x: `${currentYear}-12`, y: 0 }
        ];

        return month;
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

    // Chart
    const transactionChart = document.getElementById("transaction-chart").getContext('2d');
    const transChart = new Chart(transactionChart, {
        type: 'line',
        data: {},
        options: {}
    });

    // Chart option
    const chartOption = document.getElementById('selectChartOption');
    const chartLabel = document.getElementById('lblChartOption');
    const checkChartOption = (day, week, month) => {

        // Options
        // Weekly Sales
        const dailyData = {
            datasets: [{
                label: 'Transaction Chart',
                data: day,
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
        }
        const dailyOptions = {
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

                            value = value.toLocaleString('en-ph', {
                                style: 'currency',
                                currency: 'PHP',
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })
                            let label = `You've Earned ${value}`

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

        // Weekly Sales
        const weeklyData = {
            datasets: [{
                label: 'Transaction Chart',
                data: week,
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
        }
        const weeklyOptions = {
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

                            value = value.toLocaleString('en-ph', {
                                style: 'currency',
                                currency: 'PHP',
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })
                            let label = `You've Earned ${value}`

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

        // Monthly Sales
        const monthlyData = {
            datasets: [{
                label: 'Transaction Chart',
                data: month,
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
        }
        const monthlyOptions = {
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

                            value = value.toLocaleString('en-ph', {
                                style: 'currency',
                                currency: 'PHP',
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })
                            let label = `You've Earned ${value}`

                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month'
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

        // Default Load
        transChart.data = dailyData;
        transChart.options = dailyOptions;
        transChart.update();


        chartOption.addEventListener('change', () => {
            if (chartOption.value === 'daily') {
                chartLabel.innerText = 'Daily Sales';
                transChart.data = dailyData;
                transChart.options = dailyOptions;
                transChart.update();
            } else if (chartOption.value === 'weekly') {
                chartLabel.innerText = 'Weekly Sales';
                transChart.data = weeklyData;
                transChart.options = weeklyOptions;
                transChart.update();
            } else if (chartOption.value === 'monthly') {
                chartLabel.innerText = 'Monthly Sales';
                transChart.data = monthlyData;
                transChart.options = monthlyOptions;
                transChart.update();
            }
        })
    }

})