$(document).ready(() => {
    // Change analytics and transactions panel
    const tabLinks = document.querySelectorAll('.tab-link');
    const analyticsPanel = document.getElementById('analytics');
    const transactionsPanel = document.getElementById('transactions');
    for (const tabLinkIndex of tabLinks) {
        tabLinkIndex.addEventListener('click', () => {

            for (const clearTabLink of tabLinks) {
                clearTabLink.classList.remove('active');
            }

            tabLinkIndex.classList.add('active');

            if (tabLinkIndex.textContent === 'Analytics' && tabLinkIndex.classList.contains('active')) {
                analyticsPanel.style.display = 'block';
                transactionsPanel.style.display = 'none';
            } else if (tabLinkIndex.textContent === 'Transactions' && tabLinkIndex.classList.contains('active')) {
                analyticsPanel.style.display = 'none';
                transactionsPanel.style.display = 'block';
            }
        })
    }

})