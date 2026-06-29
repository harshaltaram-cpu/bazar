const Data = require('../models/Data');
const db = require('../config/db'); // Use the mysql2 pool

exports.updateLuckyNumber = async (req, res) => {
    const { openNumber, closeNumber } = req.body;
    const { id } = req.params;
    
    try {
        await db.query(
            'UPDATE lucky_numbers SET openNumber = ?, closeNumber = ? WHERE id = ?', 
            [openNumber, closeNumber, id]
        );
        res.status(200).json({ message: "Lucky number updated successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateData = async (req, res) => {
    try {
        const newContent = req.body.content;
        let dataEntry = await Data.findOne();

        if (!dataEntry) {
            // Create initial entry if it doesn't exist
            dataEntry = new Data({ content: newContent });
        } else {
            // Push CURRENT content into history before updating
            dataEntry.history.push({
                content: dataEntry.content,
                updatedAt: new Date()
            });
            // Update to new content
            dataEntry.content = newContent;
        }

        await dataEntry.save();
        res.status(200).json({ message: "Update successful, old data moved to history." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

async function loadAdminLuckyNumbers() {
    const response = await fetch('http://localhost:5000/api/lucky-numbers');
    const data = await response.json();
    const tbody = document.getElementById('admin-lucky-body');
    tbody.innerHTML = '';

    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td><input type="text" id="open-${item.id}" value="${item.openNumber || ''}"></td>
            <td><input type="text" id="close-${item.id}" value="${item.closeNumber || ''}"></td>
            <td><button onclick="saveLuckyNumber(${item.id})">Save</button></td>
        `;
        tbody.appendChild(row);
    });
}

async function saveLuckyNumber(id) {
    const openVal = document.getElementById(`open-${id}`).value;
    const closeVal = document.getElementById(`close-${id}`).value;

    const response = await fetch(`http://localhost:5000/api/lucky-numbers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openNumber: openVal, closeNumber: closeVal })
    });

    const result = await response.json();
    alert(result.message);
}

document.addEventListener('DOMContentLoaded', loadAdminLuckyNumbers);
