const defaultMarkets = [
    { id: 1, name: "KALYAN", openTime: "04:00 PM", closeTime: "06:00 PM", openPanna: "348", closePanna: "240" },
    { id: 2, name: "TIME BAZAR", openTime: "01:00 PM", closeTime: "02:00 PM", openPanna: "123", closePanna: "456" },
    { id: 3, name: "MILAN DAY", openTime: "03:15 PM", closeTime: "05:15 PM", openPanna: "***", closePanna: "***" }
];

// Add this to your JS logic at the bottom
document.getElementById('mobile-menu-btn').addEventListener('click', function() {
    const sidebar = document.querySelector('aside');
    sidebar.classList.toggle('open');
});

// Close sidebar when clicking a nav item on mobile
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            document.querySelector('aside').classList.remove('open');
        }
    });
});

// Add this to your JS logic at the bottom
document.getElementById('mobile-menu-btn').addEventListener('click', function() {
    const sidebar = document.querySelector('aside');
    sidebar.classList.toggle('open');
});

// Close sidebar when clicking a nav item on mobile
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            document.querySelector('aside').classList.remove('open');
        }
    });
});

const marketName = titleElement.textContent.trim().toLowerCase();
const matchedData = storedMarkets.find(m => m.name.trim().toLowerCase() === marketName);