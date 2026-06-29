// 0. AUTHENTICATION PROTECTION
if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}

// Define admin username (Fixes the crash)
const adminUsername = 'Admin';

document.getElementById('logoutButton').addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
});

// 1. STATE MANAGEMENT
let markets = [];

// Fetch markets from backend on load
async function fetchMarkets() {
    try {
        const res = await fetch('http://Laxmibazar.in/api/markets');
        
        // ADD THIS CHECK: Ensure we got a successful response before parsing JSON
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || `HTTP Status: ${res.status}`);
        }

        markets = await res.json();
        
        // Ensure it's an array before trying to render
        if (!Array.isArray(markets)) {
            throw new Error("Invalid data format received from server.");
        }

        renderDashboard();
        renderEditableResults();
    } catch (err) {
        console.error("Backend Connection Error:", err);
        document.getElementById('dash-table-body').innerHTML = `
            <tr>
                <td colspan="4" style="color:red; text-align:center;">
                    Error: ${err.message}. <br>Is Node.js running and MySQL connected? Check console for details.
                </td>
            </tr>`;
    }
}

// 2. MATKA MATH LOGIC
function getSingleDigit(panna) {
    if (panna === "***" || !panna || panna.length !== 3) return "*";
    let sum = panna.split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    return sum % 10;
}

function getFormattedResult(market) {
    let openSingle = getSingleDigit(market.openPanna);
    let closeSingle = getSingleDigit(market.closePanna);
    return `${market.openPanna}-${openSingle}${closeSingle}-${market.closePanna}`;
}

// 3. UI RENDERING
function renderHeader() {
    document.getElementById('top-username').textContent = adminUsername;
    document.getElementById('set-username').value = adminUsername;
}

function renderDashboard() {
    const tbody = document.getElementById('dash-table-body');
    tbody.innerHTML = '';
    
    if (markets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No games in Database. Please add them via MySQL.</td></tr>';
        return;
    }

    markets.forEach(m => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${m.name}</strong></td>
                <td>${m.openTime}</td>
                <td>${m.closeTime}</td>
                <td><span class="result-matrix">${getFormattedResult(m)}</span></td>
            </tr>
        `;
    });
    
    // Update metric cards
    const activeMarketsCard = document.querySelector('.metric-card h2');
    if (activeMarketsCard) activeMarketsCard.textContent = markets.length;
}

function renderEditableResults() {
    const tbody = document.getElementById('edit-table-body');
    tbody.innerHTML = '';
    
    if (markets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No games in Database.</td></tr>';
        return;
    }

    markets.forEach((m, index) => {
        tbody.innerHTML += `
            <tr>
                <td><input type="text" id="name-${index}" class="edit-input" style="width: 140px; text-align: left;" value="${m.name}" readonly></td>
                <td><input type="text" id="open-${index}" class="edit-input" value="${m.openPanna}" maxlength="3"></td>
                <td><input type="text" id="close-${index}" class="edit-input" value="${m.closePanna}" maxlength="3"></td>
                <td><span class="result-matrix" id="preview-${index}">${getFormattedResult(m)}</span></td>
                <td>
                    <button class="btn btn-save" onclick="saveResult(${index})">
                        <i class="fa-solid fa-check"></i> Save
                    </button>
                </td>
            </tr>
        `;
    });
}

// 4. ACTION FUNCTIONS
async function saveResult(index) {
    const market = markets[index];
    const openVal = document.getElementById(`open-${index}`).value || "***";
    const closeVal = document.getElementById(`close-${index}`).value || "***";

    try {
        const response = await fetch(`http://Laxmibazar.in/api/markets/${market.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: market.name, 
                openPanna: openVal, 
                closePanna: closeVal 
            })
        });

        if (response.ok) {
            // Update local array for immediate UI sync
            markets[index].openPanna = openVal;
            markets[index].closePanna = closeVal;
            
            document.getElementById(`preview-${index}`).textContent = getFormattedResult(markets[index]);
            renderDashboard();
            alert(`Result for ${market.name} saved globally!`);
        } else {
            alert("Error saving result to server.");
        }
    } catch (err) {
        alert("Error connecting to server. Make sure your Node.js backend is running.");
    }
}

// 5. TABS & CLOCK
function switchTab(tabId, element) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    
    const titles = {
        'dashboard': 'Dashboard Overview',
        'live-results': 'Manage Live Results',
        'lucky-number': 'Manage Lucky Numbers',
        'settings': 'Account Settings'
    };
    document.getElementById('page-title').textContent = titles[tabId];
    
    // Load lucky numbers when switching to that tab
    if (tabId === 'lucky-number') {
        loadAdminLuckyNumbers();
    }
}

setInterval(() => {
    document.getElementById('live-time').textContent = new Date().toLocaleString('en-IN');
}, 1000);

// 6. INITIALIZATION (Clean Database Fetch)
document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    fetchMarkets();
    loadAdminLuckyNumbers(); // Load lucky numbers on page load
});

// ==========================================
// LUCKY NUMBER MANAGEMENT
// ==========================================

let luckyNumbersData = [];

// Fetch First 5 Lucky Numbers from Database
async function loadAdminLuckyNumbers() {
    try {
        const res = await fetch('http://laxmibaazar.in/api/lucky-numbers');
        
        if (!res.ok) {
            throw new Error('Failed to fetch lucky numbers');
        }

        const allLuckyNumbers = await res.json();
        
        // Get only first 5 games
        luckyNumbersData = allLuckyNumbers.slice(0, 5);
        
        renderAdminLuckyNumbers();
    } catch (err) {
        console.error("Error fetching lucky numbers:", err);
        document.getElementById('admin-lucky-body').innerHTML = `
            <tr>
                <td colspan="4" style="color:red; text-align:center;">
                    Error loading lucky numbers: ${err.message}
                </td>
            </tr>`;
    }
}

// Render Lucky Numbers in Admin Panel Table
function renderAdminLuckyNumbers() {
    const tbody = document.getElementById('admin-lucky-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (luckyNumbersData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No games found. Please add games to the database.</td></tr>';
        return;
    }
    
    luckyNumbersData.forEach((item) => {
        const row = document.createElement('tr');
        
        const gameNameCell = document.createElement('td');
        gameNameCell.innerHTML = `<strong>${item.name}</strong>`;
        
        const openCell = document.createElement('td');
        const openInput = document.createElement('input');
        openInput.type = 'text';
        openInput.id = `lucky-open-${item.id}`;
        openInput.className = 'edit-input';
        openInput.style.width = '100px';
        openInput.style.textAlign = 'center';
        openInput.value = item.openNumber || '';
        openInput.maxLength = '7';
        openInput.placeholder = 'Open';
        openCell.appendChild(openInput);
        
        const closeCell = document.createElement('td');
        const closeInput = document.createElement('input');
        closeInput.type = 'text';
        closeInput.id = `lucky-close-${item.id}`;
        closeInput.className = 'edit-input';
        closeInput.style.width = '100px';
        closeInput.style.textAlign = 'center';
        closeInput.value = item.closeNumber || '';
        closeInput.maxLength = '7';
        closeInput.placeholder = 'Close';
        closeCell.appendChild(closeInput);
        
        const actionCell = document.createElement('td');
        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-save';
        saveBtn.onclick = function() { saveLuckyNumber(item.id); };
        saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save';
        actionCell.appendChild(saveBtn);
        
        row.appendChild(gameNameCell);
        row.appendChild(openCell);
        row.appendChild(closeCell);
        row.appendChild(actionCell);
        
        tbody.appendChild(row);
    });
}

// Save Updated Lucky Number to Database
async function saveLuckyNumber(id) {
    const openVal = document.getElementById(`lucky-open-${id}`).value.trim();
    const closeVal = document.getElementById(`lucky-close-${id}`).value.trim();
    
    try {
        const response = await fetch(`http://laxmibaazar.in/api/lucky-numbers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ openNumber: openVal, closeNumber: closeVal })
        });

        if (response.ok) {
            alert(`✓ Lucky Number updated successfully!`);
            // Reload to reflect changes on main site
            loadAdminLuckyNumbers();
        } else {
            const errData = await response.json();
            alert(`Failed to update lucky number: ${errData.error || 'Unknown error'}`);
        }
    } catch (err) {
        console.error('Save error:', err);
        alert("Error connecting to server. Make sure your Node.js backend is running.");
    }
}

