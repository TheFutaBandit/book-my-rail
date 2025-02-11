const fs = require('fs');
const path = require('path');
const pool = require('./db');

const initializeDb = async () => {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'database.sql')).toString();
        
        await pool.query(sql);
        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
};

initializeDb();