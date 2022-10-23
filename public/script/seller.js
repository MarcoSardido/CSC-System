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
            
            if (getPath) {
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
            } else {
                list[i].closest('li').className = 'active';
            }
        }

        if (currentLocation.split('/')[4] === 'products' && currentLocation.split('/').length === 6) {
            list[1].closest('li').className = 'active';
        }
    }

    $(function () {
        $('[data-toggle="popover"]').popover({
            trigger: 'focus'
        })
    })


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