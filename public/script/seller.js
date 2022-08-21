$(document).ready(() => {

    //! ---------------------------------------------------------------------------------
    //                          Seller Navigation Functions
    //! ---------------------------------------------------------------------------------
    let menuToggle = document.querySelector('.toggle');
    let navigation = document.querySelector('.navigation');
    let settingsTab = document.getElementById('listSettings');

    menuToggle.onclick = () => {
        menuToggle.classList.toggle('active');
        navigation.classList.toggle('active');
    };

    const currentLocation = location.href;

    //Add "Active" class in the selected list item
    let list = document.querySelectorAll('a');
    const menuLength = list.length;

    for (let i = 0; i < menuLength; i++) {

        if (list[i].href === currentLocation) {
            const getPath = list[i].href.split('/')[4];
            const checkTab = getPath.split('?');

            if (checkTab[0] === 'settings') {
                if (!settingsTab.classList.contains('active')) {
                    settingsTab.classList.add('active')
                }
                
                list[i].classList.add('active')
                list[i].closest('li').className = 'active';
            } else {
                list[i].closest('li').className = 'active';
            }

            
        }
    }

    let checkbox = document.getElementById('checkbox');
    let content = document.querySelector('.home-content')
    checkbox.addEventListener('change', () => {
        content.classList.toggle('dark');
    })

    $(function () {
        $('[data-toggle="popover"]').popover({
            trigger: 'focus'
        })
    })

    //! ---------------------------------------------------------------------------------
    //                             Transaction Functions
    //! ---------------------------------------------------------------------------------
    const tabs = document.querySelectorAll('.tab-link');

    const analyticsPanel = document.getElementById('analytics');
    const transactionsPanel = document.getElementById('transactions');

    for (let i = 0; i < tabs.length; i++) {
        tabs[i].onclick = () => {
            let j = 0;
            while (j < tabs.length) {
                tabs[j++].className = 'tab-link';
            };

            if ([i] == 0) {
                tabs[2].className = 'show-all tab-link';
                analyticsPanel.style.display = "block";
                transactionsPanel.style.display = "none";
            } else if ([i] == 1) {
                tabs[2].className = 'show-all tab-link';
                analyticsPanel.style.display = "none";
                transactionsPanel.style.display = "block";
            }
            tabs[i].className = 'list active';

            if ([i] == 2) {
                tabs[2].className = 'show-all tab-link';
                analyticsPanel.style.display = "none";
                transactionsPanel.style.display = "block";
                tabs[1].className = 'list active';
            }
        };
    };


    //! ---------------------------------------------------------------------------------
    //                             Settings Functions
    //! ---------------------------------------------------------------------------------
    const settingsMenu = document.querySelectorAll('.settings-link');
    for (const menuIndex of settingsMenu) {
        menuIndex.addEventListener('click', () => {
            console.log(menuIndex)
        })
    }


});