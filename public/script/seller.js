$(document).ready(() => {

    let menuToggle = document.querySelector('.toggle');
    let navigation = document.querySelector('.navigation');

    menuToggle.onclick = () => {
        menuToggle.classList.toggle('active');
        navigation.classList.toggle('active');
    };

    const currentLocation = location.href;

    //Add "Active" class in the selected list item
    let list = document.querySelectorAll('a');

    // let dashboard = document.getElementById('dashSection');
    // let product = document.getElementById('prodSection');
    // let transaction = document.getElementById('transactSection');
    // let report = document.getElementById('reportSection');
    // let settings = document.getElementById('settingSection');

    const menuLength = list.length;

    for(let i=0; i<menuLength; i++) {
        if(list[i].href === currentLocation) {
            list[i].closest('li').className = 'active';
        }
    }
            
    // for (let i = 0; i < list.length; i++) {
    //     list[i].onclick = () => {
    //         let j = 0;
    //         while(j < list.length) {
    //             list[j++].className = 'list';
    //         };

    //         // if([i] == 0) {
    //         //     dashboard.style.display = "block";
    //         //     product.style.display = "none";
    //         //     transaction.style.display = "none";
    //         //     report.style.display = "none";
    //         //     settings.style.display = "none";
    //         // } else if([i] == 1) {
    //         //     dashboard.style.display = "none";
    //         //     product.style.display = "block";
    //         //     transaction.style.display = "none";
    //         //     report.style.display = "none";
    //         //     settings.style.display = "none";
    //         // } else if([i] == 2) {
    //         //     dashboard.style.display = "none";
    //         //     product.style.display = "none";
    //         //     transaction.style.display = "block";
    //         //     report.style.display = "none";
    //         //     settings.style.display = "none";
    //         // } else if([i] == 3) {
    //         //     dashboard.style.display = "none";
    //         //     product.style.display = "none";
    //         //     transaction.style.display = "none";
    //         //     report.style.display = "block";
    //         //     settings.style.display = "none";
    //         // } else if([i] == 4) {
    //         //     dashboard.style.display = "none";
    //         //     product.style.display = "none";
    //         //     transaction.style.display = "none";
    //         //     report.style.display = "none";
    //         //     settings.style.display = "block";
    //         // }

    //         list[i].className = 'list active';
    //     };
    // };

    let checkbox = document.getElementById('checkbox');
    let content = document.querySelector('.home-content')
    checkbox.addEventListener('change', () => {
        content.classList.toggle('dark');
    })
    
    $('#tableData-prod').DataTable( {
        "lengthMenu": [[4], [4]]
    } );

    $(function () {
        $('[data-toggle="popover"]').popover({
            trigger: 'focus'
        })
      })

    /**
     * 
     * 
     * Charts
     * 
     * 
     */

    let transactionChart = document.getElementById("transaction-chart").getContext('2d');
    let labels = ['01 June', '02 June', '05 June', '08 June', '11 June', '13 June'];

    //Global Options

    let chart = new Chart(transactionChart, {
        type: 'line',
        data: {
            labels: labels,
            datasets:[{
                label: 'Transaction Chart',
                data: [646, 564, 127, 356, 900, 500],
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
                            let label = `You've Earned $${value}`

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



    /**
     * 
     * 
     * Transactions Scripts
     * 
     * 
     */

    
     $('#tableData-transact').DataTable( {
        "lengthMenu": [[5], [5]]
    } );

     let tabs = document.querySelectorAll('.tab-link');

     let analyticsPanel = document.getElementById('analytics');
     let transactionsPanel = document.getElementById('transactions');
     let financePanel = document.getElementById('finance');


     for (let i = 0; i < tabs.length; i++) {
        tabs[i].onclick = () => {
            let j = 0;
            while(j < tabs.length) {
                tabs[j++].className = 'tab-link';
            };

            if([i] == 0) {
                analyticsPanel.style.display = "block";
                transactionsPanel.style.display = "none";
                financePanel.style.display = "none";
            } else if([i] == 1) {
                analyticsPanel.style.display = "none";
                transactionsPanel.style.display = "block";
                financePanel.style.display = "none";
            } else if([i] == 2) {
                analyticsPanel.style.display = "none";
                transactionsPanel.style.display = "none";
                financePanel.style.display = "block";
            }

            tabs[i].className = 'list active';
        };
    };

    

});