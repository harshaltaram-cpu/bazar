// autoUpdater.js
const cron = require('node-cron');
const axios = require('axios');
const cheerio = require('cheerio');
const db = require('./config/db'); // Use your existing DB connection

// Reusing your helper function
function getSingleDigit(panna) {
    if (panna === "***" || !panna || panna.length !== 3) return "*";
    let sum = panna.split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    return (sum % 10).toString();
}

async function fetchAndSaveResults() {
    try {
        console.log("Fetching latest results from external website...");
        
        // 1. Fetch the HTML from the target website
        const targetUrl = 'https://example-target-website.com/results'; 
        const response = await axios.get(targetUrl);
        
        // 2. Load the HTML into Cheerio to parse it
        const $ = cheerio.load(response.data);

        // 3. Loop through the elements on their site that contain the results.
        // NOTE: You must inspect the target website's HTML to find the correct CSS classes/selectors.
        $('.result-row').each(async (index, element) => {
            const marketName = $(element).find('.market-name').text().trim();
            const openPanna = $(element).find('.open-panna').text().trim();
            const closePanna = $(element).find('.close-panna').text().trim();

            if(marketName && openPanna) {
                await updateDatabase(marketName, openPanna, closePanna);
            }
        });

    } catch (error) {
        console.error("Error scraping data:", error.message);
    }
}

async function updateDatabase(name, openPanna, closePanna) {
    try {
        // Update live market (Matched by Name instead of ID since scraping won't know your DB IDs)
        await db.query(
            'UPDATE markets SET openPanna = ?, closePanna = ? WHERE name = ?',
            [openPanna, closePanna, name]
        );

        const openSingle = getSingleDigit(openPanna);
        const closeSingle = getSingleDigit(closePanna);
        const jodi = `${openSingle}${closeSingle}`;
        const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

        // Update Market History (Same logic as your server.js)
        const [existing] = await db.query(
            'SELECT * FROM market_history WHERE market_name = ? AND record_date = ?',
            [name, todayDate]
        );

        if (existing.length > 0) {
            await db.query(
                'UPDATE market_history SET openPanna = ?, jodi = ?, closePanna = ? WHERE id = ?',
                [openPanna, jodi, closePanna, existing[0].id]
            );
        } else {
            await db.query(
                'INSERT INTO market_history (market_name, record_date, openPanna, jodi, closePanna) VALUES (?, ?, ?, ?, ?)',
                [name, todayDate, openPanna, jodi, closePanna]
            );
        }
        console.log(`Successfully updated ${name} automatically.`);
    } catch (err) {
        console.error(`DB Error updating ${name}:`, err.message);
    }
}

// 4. Schedule the job to run automatically
// This cron expression '*/5 * * * *' means "Run every 5 minutes". 
// You can change it to specific times if you prefer.
cron.schedule('*/5 * * * *', () => {
    fetchAndSaveResults();
});

module.exports = { fetchAndSaveResults };