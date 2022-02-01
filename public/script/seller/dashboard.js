/**
 * 
 * Live Stream Chart
 * 
 */

 let liveStreamChart = document.getElementById("liveStream-chart").getContext('2d');
 let labels = ['01 June', '02 June', '05 June', '08 June', '11 June', '13 June'];

 let chart = new Chart(liveStreamChart, {
    type: 'line',
    data: {
        labels: labels,
        datasets:[{
            label: 'Transaction Chart',
            data: [16, 26, 20, 31, 38, 47],
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
            title:{
                display:false
            },
            legend:{
                display:false
            },
            tooltip:{
                backgroundColor:'rgb(72, 95, 237, 0.8)',
                displayColors: false,

                bodyFont:{
                    size: 15,
                },
                callbacks: {
                    label: function(item) {
                        let value = item.raw;
                        value = value.toLocaleString();
                        let label = `Total Views: ${value}`;
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display:false
                }
            },
            y: {
                grid: {
                    display:false
                }
            }
        }
    }
});