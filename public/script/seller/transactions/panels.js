import {
    dataForAnalytics,
} from './Api/getTransactions.js'

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    dataForAnalytics(trimmedUID).then(res => {
        let todaysProfit = 0;
        let totalRevenue = 0;
        const currDate = stringDateFormat();

        for (const item of res) {
            if (item.date !== currDate) continue;

            let amount = item.totalPrice;
            amount = amount.replace(/[^\d\.]/g, "");
            amount = parseFloat(amount);
            todaysProfit += amount;
        }

        for (const revItem of res) {
            let amount = revItem.totalPrice;
            amount = amount.replace(/[^\d\.]/g, "");
            amount = parseFloat(amount);
            totalRevenue += amount;
        }

        const lastWeekProfit = getLastWeekProfit(res);

        return { todaysProfit, totalRevenue, lastWeekProfit };
    }).then(({ todaysProfit, totalRevenue, lastWeekProfit }) => {
        $('#todayProfit').text(`₱${todaysProfit.toLocaleString()}`)
        $('#lastWeek').text(`₱${lastWeekProfit.toLocaleString()}`)
        $('#totalRevenue').text(`₱${totalRevenue.toLocaleString()}`)
    })


    const getLastWeekProfit = (data) => {
        const dataDates = [];
        const last7Days = getLastWeek();
        let lastWeekProfit = 0;

        for (const weekIndex of data) {
            dataDates.push({
                date: convertStringDateToNumDate(weekIndex.date),
                profit: weekIndex.totalPrice,
            })
        }

        for (const dataDayIndex of dataDates) {
            if (last7Days.includes(dataDayIndex.date)) {
                let amount = dataDayIndex.profit;
                amount = amount.replace(/[^\d\.]/g, "");
                amount = parseFloat(amount);
                lastWeekProfit += amount;
            }
        }

        return lastWeekProfit;
    }

    const stringDateFormat = () => {
        let currentDate;
        const date = new Date();
        const formattedDate = date.toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        }).replace(/ /g, ' ');
        currentDate = formattedDate.split(' ')
        if (currentDate[0] < 10) {
            currentDate[0] = `0${currentDate[0]}`;
        }
        return currentDate.join(' ');
    }

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
        for (let i = 7; 0 < i; i--) {
            let d = new Date();
            d.setDate(d.getDate() - i);
            result.push(formatDate(d))
        }
        return result;
    }

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

})