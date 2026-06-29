// 1. Math logic to get the single digit
function getSingleDigit(panna) {
    if (panna === "***" || !panna || panna.length !== 3) return "*";
    let sum = panna.split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    return sum % 10;
}

// 2. Main function to update the DOM from the Backend API
async function updateMarketResults() {
    try {
        const response = await fetch('http://laxmibaazar.in/api/markets');
        const storedMarkets = await response.json();
        
        if (!storedMarkets || storedMarkets.length === 0) return;

        const cards = document.querySelectorAll('.result-card');
        
        cards.forEach(card => {
            const titleElement = card.querySelector('h2');
            const numberElement = card.querySelector('.result-number');
            const timeElement = card.querySelector('.result-timer');

            if (!titleElement || !numberElement) return;

            const marketName = titleElement.textContent.trim().toLowerCase();
            const matchedData = storedMarkets.find(m => m.name.trim().toLowerCase() === marketName);

            if (matchedData) {
                const openSingle = getSingleDigit(matchedData.openPanna);
                const closeSingle = getSingleDigit(matchedData.closePanna);
                
                // Update the visual numbers
                numberElement.textContent = `${matchedData.openPanna}-${openSingle}${closeSingle}-${matchedData.closePanna}`;

                // Update the visual time if available
                if (timeElement && matchedData.openTime && matchedData.closeTime) {
                    timeElement.textContent = `(${matchedData.openTime} - ${matchedData.closeTime})`;
                }
            }
        });
    } catch (error) {
        console.error("Error fetching live results:", error);
    }
}

// 3. Initialize on load and refresh every 2 seconds
document.addEventListener("DOMContentLoaded", () => {
    updateMarketResults(); // Initial load
    setInterval(updateMarketResults, 2000); // Live sync

    // Make "View" buttons dynamic (Directs to the History Chart Tab)
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); 
            const card = e.target.closest('.result-card');
            const gameName = card.querySelector('h2').textContent.trim();
            window.location.href = `history.html?game=${encodeURIComponent(gameName)}`;
        });
    });
});

// ==========================================
// FETCH AND RENDER LUCKY NUMBERS
// ==========================================
async function updateLuckyNumbers() {
    try {
        const response = await fetch('http://laxmibaazar.in/api/lucky-numbers');
        const luckyNumbers = await response.json();
        
        const container = document.getElementById('dynamic-lucky-numbers');
        if (!container) return;
        
        container.innerHTML = ''; // Clear previous

        luckyNumbers.forEach(item => {
            // Only render cards that have at least one lucky number filled out
            if (item.openNumber || item.closeNumber) {
                container.innerHTML += `
                    <div class="lucky-card">
                        <h2>${item.name}</h2>
                        <div class="lucky-number-display">
                            <div class="lucky-row">
                                <span class="lucky-label">Open:</span> 
                                <span class="lucky-val">${item.openNumber || '-'}</span>
                            </div>
                            <div class="lucky-row">
                                <span class="lucky-label">Close:</span> 
                                <span class="lucky-val">${item.closeNumber || '-'}</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
    } catch (error) {
        console.error("Error fetching lucky numbers:", error);
    }
}

// Function to fetch and display Lucky Numbers
async function loadLuckyNumbers() {
    try {
        // Fetch data from your backend
        const response = await fetch('http://laxmibaazar.in/api/lucky-numbers');
        const luckyNumbers = await response.json();
        
        const tbody = document.getElementById('lucky-numbers-body');
        tbody.innerHTML = ''; // Clear the "Loading..." text
        
        // Loop through the games and create a row for each
        luckyNumbers.slice(0, 5).forEach(game => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="game-name">${game.name}</td>
                <td class="lucky-open">${game.openNumber ? game.openNumber : '-'}</td>
                <td class="lucky-close">${game.closeNumber ? game.closeNumber : '-'}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading lucky numbers:", error);
        document.getElementById('lucky-numbers-body').innerHTML = 
            `<tr><td colspan="3">Failed to load lucky numbers.</td></tr>`;
    }
}

// Make sure to call this function when the page loads!
document.addEventListener('DOMContentLoaded', () => {
    loadLuckyNumbers(); // Initial load
    setInterval(loadLuckyNumbers, 3000); // Auto-refresh every 3 seconds to sync with admin updates
    
    // (If you have other functions that run on load, keep them here too)
});