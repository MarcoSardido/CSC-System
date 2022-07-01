import {
    dataForAnalytics,
} from './Api/getTransactions.js'

$(document).ready(() => {
    const uuid = $('#uid').text();
    const trimmedUID = uuid.trim();

    dataForAnalytics(trimmedUID).then(res => {
        let todaysProfit = 0;
        const currDate = stringDateFormat();

        for (const item of res) {
            if (item.date !== currDate) continue;

            let amount = item.totalPrice;
            amount = amount.replace(/[^\d\.]/g, "");
            amount = parseFloat(amount);
            todaysProfit += amount
        }
        return todaysProfit
    }).then((todaysProfit) => {
        $('#todayProfit').text(`₱${todaysProfit}`)
    })



    const calcTodayProfit = () => {

    }


    // Result: 01 Jul 2022 -> 222-07-01
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

})