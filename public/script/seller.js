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
});