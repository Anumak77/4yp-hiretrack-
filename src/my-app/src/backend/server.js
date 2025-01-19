const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const cors = require('cors');

const app = express();
const PORT = 5001;

app.use(cors());

// Load CSV data
app.get('/jobs', (req, res) => {
    let jobs = [];
    fs.createReadStream(path.join(__dirname, '../mockData.csv'))  // ✅ Corrected file path
        .pipe(csv())
        .on('data', (row) => {
            console.log("Row Read:", row);  // ✅ Debugging line to see data
            if (row['Title'] && row['Company']) {  // Use correct column names
                jobs.push(row);
            }
        })
        
        .on('end', () => {
            // ✅ Send only the last 100 valid job posts
            res.json(jobs.slice(-100));
        })
        .on('error', (err) => {
            console.error('Error reading CSV:', err);
            res.status(500).json({ error: 'Failed to read CSV' });
        });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
