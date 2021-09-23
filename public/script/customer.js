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
                settings.style.display = "none";
            } else if([i] == 1) {
                dashboard.style.display = "none";
                product.style.display = "block";
                transaction.style.display = "none";
                settings.style.display = "none";
            } else if([i] == 2) {
                dashboard.style.display = "none";
                product.style.display = "none";
                transaction.style.display = "block";
                settings.style.display = "none";
            } else if([i] == 3) {
                dashboard.style.display = "none";
                product.style.display = "none";
                transaction.style.display = "none";
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

    /**
     * Order Script
     */

        /**
         * Script Block for Order Links 
         */

        //Getting all the id
        let order_FilterAll = document.getElementById('order-filter-all');
        let order_FilterToShip = document.getElementById('order-filter-toShip');
        let order_FilterToReceive = document.getElementById('order-filter-toReceive');
        let order_FilterDelivered = document.getElementById('order-filter-delivered');

        //Looping through links
        let order_TabLinks = document.querySelectorAll(".order-tab-link");

        for (let i = 0; i < order_TabLinks.length; i++) {
            order_TabLinks[i].onclick = () => {
                let j = 0;
                while(j < order_TabLinks.length) {
                    order_TabLinks[j++].className = 'order-tab-link';
                };
                
                if([i] == 0) {
                    order_FilterAll.style.display = "block";
                    order_FilterToShip.style.display = "none";
                    order_FilterToReceive.style.display = "none";
                    order_FilterDelivered.style.display = "none";
                } else if([i] == 1) {
                    order_FilterAll.style.display = "none";
                    order_FilterToShip.style.display = "block";
                    order_FilterToReceive.style.display = "none";
                    order_FilterDelivered.style.display = "none";
                } else if([i] == 2) {
                    order_FilterAll.style.display = "none";
                    order_FilterToShip.style.display = "none";
                    order_FilterToReceive.style.display = "block";
                    order_FilterDelivered.style.display = "none";
                } else if([i] == 3) {
                    order_FilterAll.style.display = "none";
                    order_FilterToShip.style.display = "none";
                    order_FilterToReceive.style.display = "none";
                    order_FilterDelivered.style.display = "block";
                }

                order_TabLinks[i].className = 'order-tab-link active';
            };
        };


    // Script Block for Order Side Row
     let order_ListOfRows = document.querySelectorAll('.list-row-order');

     for (let i = 0; i < order_ListOfRows.length; i++) {
        order_ListOfRows[i].onclick = () => {
            let j = 0;
            while(j < order_ListOfRows.length) {
                order_ListOfRows[j++].className = 'list-row-order';
            };
            order_ListOfRows[i].className = 'list-row-order active';
        };
    };

    /**
     * Review Script
     */

    let review_ListOfRows = document.querySelectorAll('.list-row-review');

    for (let i = 0; i < review_ListOfRows.length; i++) {
        review_ListOfRows[i].onclick = () => {
            let j = 0;
            while(j < review_ListOfRows.length) {
                review_ListOfRows[j++].className = 'list-row-review';
            };

            review_ListOfRows[i].className = 'list-row-review active';
        };
    };

    /**
     * Settings Script
     */

    let accountPanel = document.getElementById('account-panel');
    let addressPanel = document.getElementById('address-panel');
    let paymentPanel = document.getElementById('payment-panel');
    let faqPanel = document.getElementById('faq-panel');
    let contactPanel = document.getElementById('contact-panel');


    let listOfLinks = document.querySelectorAll('.settings-menu-link');
    for (let i = 0; i < listOfLinks.length; i++) {
        listOfLinks[i].onclick = () => {
            let j = 0;
            while(j < listOfLinks.length) {
                listOfLinks[j++].className = 'settings-menu-link';
            };

            if([i] == 0) {
                accountPanel.style.display = "block";
                addressPanel.style.display = "none";
                paymentPanel.style.display = "none";
                faqPanel.style.display = "none";
                contactPanel.style.display = "none";
            } else if([i] == 1) {
                accountPanel.style.display = "none";
                addressPanel.style.display = "block";
                paymentPanel.style.display = "none";
                faqPanel.style.display = "none";
                contactPanel.style.display = "none";
            } else if([i] == 2) {
                accountPanel.style.display = "none";
                addressPanel.style.display = "none";
                paymentPanel.style.display = "block";
                faqPanel.style.display = "none";
                contactPanel.style.display = "none";
            } else if([i] == 3) {
                accountPanel.style.display = "none";
                addressPanel.style.display = "none";
                paymentPanel.style.display = "none";
                faqPanel.style.display = "block";
                contactPanel.style.display = "none";
            } else if([i] == 4) {
                accountPanel.style.display = "none";
                addressPanel.style.display = "none";
                paymentPanel.style.display = "none";
                faqPanel.style.display = "none";
                contactPanel.style.display = "block";
            }

            listOfLinks[i].className = 'settings-menu-link active';
        };
    };



});