$(document).ready(() => {
    // Change sales and transactions panel
    const tabLinks = document.querySelectorAll('.tab-link');
    const analyticsPanel = document.getElementById('analytics');
    const transactionsPanel = document.getElementById('transactions');
    for (const tabLinkIndex of tabLinks) {
        tabLinkIndex.addEventListener('click', () => {

            for (const clearTabLink of tabLinks) {
                clearTabLink.classList.remove('active');
            }

            if (tabLinkIndex.textContent !== 'Show All') {
                tabLinkIndex.classList.add('active');
            }

            if (tabLinkIndex.textContent === 'Sales' && tabLinkIndex.classList.contains('active')) {
                analyticsPanel.style.display = 'block';
                transactionsPanel.style.display = 'none';
            } else if (tabLinkIndex.textContent === 'Transactions' && tabLinkIndex.classList.contains('active')) {
                analyticsPanel.style.display = 'none';
                transactionsPanel.style.display = 'block';
            } else if (tabLinkIndex.textContent === 'Show All') {
                tabLinks[1].classList.add('active');
                analyticsPanel.style.display = 'none';
                transactionsPanel.style.display = 'block';
            }
        })
    }

})