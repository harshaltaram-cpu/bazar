require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // MySQL Connection

const app = express();

app.use(cors());
app.use(express.json());

// Helper function to calculate Jodi
function getSingleDigit(panna) {
    if (panna === "***" || !panna || panna.length !== 3) return "*";
    let sum = panna.split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    return (sum % 10).toString();
}

// 1. Get Live Markets (For Home Page & Dashboard)
app.get('/api/markets', async (req, res) => {
    try {
        const [markets] = await db.query('SELECT * FROM markets');
        res.json(markets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/// 2. Update Live Result, Save to History & Auto-Update Lucky Number
app.put('/api/markets/:id', async (req, res) => {
    const { name, openPanna, closePanna } = req.body;
    try {
        // Update live market
        await db.query('UPDATE markets SET openPanna = ?, closePanna = ? WHERE id = ?', [openPanna, closePanna, req.params.id]);

        // Generate Jodi and Single Digits
        const openSingle = getSingleDigit(openPanna);
        const closeSingle = getSingleDigit(closePanna);
        const jodi = `${openSingle}${closeSingle}`;

        // --- NEW: Automatically Update Lucky Number ---
        // If the single digit is "*", we save it as blank in lucky numbers
        const luckyOpen = openSingle === "*" ? "" : openSingle;
        const luckyClose = closeSingle === "*" ? "" : closeSingle;
        
        await db.query('UPDATE lucky_numbers SET openNumber = ?, closeNumber = ? WHERE name = ?', [luckyOpen, luckyClose, name]);
        // ----------------------------------------------
        
        // Get today's date formatted perfectly
        const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

        // Check if history for today already exists
        const [existing] = await db.query('SELECT * FROM market_history WHERE market_name = ? AND record_date = ?', [name, todayDate]);

        if (existing.length > 0) {
            // Update existing history record
            await db.query('UPDATE market_history SET openPanna = ?, jodi = ?, closePanna = ? WHERE id = ?', [openPanna, jodi, closePanna, existing[0].id]);
        } else {
            // Insert new history record
            await db.query('INSERT INTO market_history (market_name, record_date, openPanna, jodi, closePanna) VALUES (?, ?, ?, ?, ?)', [name, todayDate, openPanna, jodi, closePanna]);
        }

        res.json({ message: "Market, History, and Lucky Number updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get History for a Specific Game (For History Page)
app.get('/api/history/:marketName', async (req, res) => {
    try {
        const [history] = await db.query('SELECT * FROM market_history WHERE market_name = ? ORDER BY record_date DESC LIMIT 30', [req.params.marketName]);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Get the First 5 Lucky Numbers
// Ensure your backend query looks like this:
app.get('/api/lucky-numbers', async (req, res) => {
    try {
        // Explicitly select id to ensure it is sent to frontend
        const [luckyNumbers] = await db.query('SELECT id, name, openNumber, closeNumber FROM lucky_numbers');
        res.json(luckyNumbers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Update a specific Lucky Number
// Ensure this specific controller action configuration is matched perfectly:
app.put('/api/lucky-numbers/:id', async (req, res) => {
    const { openNumber, closeNumber } = req.body;
    try {
        await db.query('UPDATE lucky_numbers SET openNumber = ?, closeNumber = ? WHERE id = ?', [openNumber, closeNumber, req.params.id]);
        res.json({ message: "Lucky number section database fields synchronized successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. AUTO-SETUP ROUTE: Add all 21 games to Database automatically
// Replace your existing app.get('/api/setup', ...) with this code:
app.get('/api/setup', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT COUNT(*) AS count FROM markets');
        
        if (rows[0].count === 0) {
            const games = [
                'MahaKalyan', 'Maha Kalyan night', 'Bada bazar', 'Bada bazar night',
                'Triveni sangam', 'Madhur Morning', 'Shridevi', 'Time bazar',
                'Madhur day', 'Milan day', 'Rajdhaniday', 'Kalyan', 'Kalyan night',
                'Sridevi night', 'Madhur night', 'Milan night', 'Rajdhani night',
                'Main bazar', 'Manipur', 'Subhang', 'Nagpur day'
            ];
            
            for (let game of games) {
                // Inserts into markets table
                await db.query('INSERT INTO markets (name, openTime, closeTime) VALUES (?, ?, ?)', [game, '04:40 PM', '06:40 PM']);
                // Inserts corresponding placeholder entry into lucky_numbers table
                await db.query('INSERT INTO lucky_numbers (name, openNumber, closeNumber) VALUES (?, ?, ?)', [game, '', '']);
            }
            res.send("<h1 style='color:green;'>Setup Complete! 21 games & lucky numbers added. Refresh phpMyAdmin!</h1>");
        } else {
            res.send("<h1>Database already initialized. No new rows added.</h1>");
        }
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});