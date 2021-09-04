$(document).ready(() => {
    let menuToggle = document.querySelector('.toggle');
    let navigation = document.querySelector('.navigation');

    menuToggle.onclick = () => {
        menuToggle.classList.toggle('active');
        navigation.classList.toggle('active');
    };

    //Add "Active" class in the selected list item
    let list = document.querySelectorAll('.list');

    let dashboard = document.getElementById('dashSection');
    let product = document.getElementById('prodSection');
    let transaction = document.getElementById('transactSection');
    let report = document.getElementById('reportSection');
    let settings = document.getElementById('settingSection');
            
    for (let i = 0; i < list.length; i++) {
        list[i].onclick = () => {
            let j = 0;
            while(j < list.length) {
                list[j++].className = 'list';
            };

            if([i] == 0) {
                dashboard.style.display = "block";
            product.style.display = "none";
            transaction.style.display = "none";
            report.style.display = "none";
                settings.style.display = "none";
            } else if([i] == 1) {
                dashboard.style.display = "none";
                product.style.display = "block";
                transaction.style.display = "none";
                report.style.display = "none";
                settings.style.display = "none";
            } else if([i] == 2) {
                dashboard.style.display = "none";
                product.style.display = "none";
                transaction.style.display = "block";
                report.style.display = "none";
                settings.style.display = "none";
            } else if([i] == 3) {
                dashboard.style.display = "none";
                product.style.display = "none";
                transaction.style.display = "none";
                report.style.display = "block";
                settings.style.display = "none";
            } else if([i] == 4) {
                dashboard.style.display = "none";
                product.style.display = "none";
                transaction.style.display = "none";
                report.style.display = "none";
                settings.style.display = "block";
            }

            list[i].className = 'list active';
        };
    };

    let checkbox = document.getElementById('checkbox');
    let content = document.querySelector('.home-content')
    checkbox.addEventListener('change', () => {
        content.classList.toggle('dark');
    })

    $('#tableData').DataTable( {
        "lengthMenu": [[4], [4]]
    } );


    /**
     * 
     * 
     * Charts
     * 
     * 
     */

    let transactionChart = document.getElementById("transaction-chart").getContext('2d');
    let labels = ['07 June', '08 June', '08 June', '09 June', '10 June', '11 June', '12 June', '13 June'];

    //Global Options

    let chart = new Chart(transactionChart, {
        type: 'line',
        data: {
            labels: labels,
            datasets:[{
                label: 'Transaction History',
                data: [151, 825, 625, 479, 1305, 1183, 575, 1619],
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








});