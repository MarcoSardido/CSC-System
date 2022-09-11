$(document).ready(() => {

    //* ----------------------------------------------------------------------------------------
    //  ---------------------------------- Global Selectors ------------------------------------ 
    //* ---------------------------------------------------------------------------------------- 
    const btnShowCart = document.getElementById('btnCart');
    const cartDropdownMenu = document.getElementById('dropdownCart');
    const cartContainer = document.querySelector('.cart-container');

    const btnExitMarket = document.getElementById('btnExitMarket');


    // Exit Marketplace
    btnExitMarket.addEventListener('click', () => {
        window.location.assign('/customercenter')
    })


    // Show Cart Function
    btnShowCart.addEventListener('click', () => {
        btnShowCart.classList.add('active')
        toggleCartShow();
    })

    const toggleCartShow = () => {
        if (!btnShowCart.classList.contains('active')) {
            cartDropdownMenu.addEventListener('mouseleave', () => {
                btnShowCart.classList.remove('active')
            })
        }
    }


    const showEmptyText = () => {
        let textContext = `
            <p class="empty">
                You have no items in your cart. 🙁
            </p>
        `;
        cartContainer.insertAdjacentHTML('beforeend', textContext)
    }

    const removeCartItem = () => {
        // Selector
        const cartItems = document.querySelectorAll('#btnRemoveItem');

        for (const itemIndex of cartItems) {
            itemIndex.addEventListener('click', () => {
                const ItemElNode = itemIndex.parentNode.parentNode;
                const getRemoveIndex = Array.from(cartContainer.children).indexOf(ItemElNode);
                cartContainer.removeChild(cartContainer.children[getRemoveIndex]);

                if (cartContainer.children.length === 0) {
                    showEmptyText();
                }
            })
        }
    }

    /**
     * ? Show if no items in cart
     * @showEmptyText
     */
    if (cartContainer.children.length === 0) {
        showEmptyText();
    }

    removeCartItem();
    toggleCartShow();
})