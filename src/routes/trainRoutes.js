const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');


router.post('/', authenticateAdmin, async (req, res) => {
    try {
        const { name, source, destination, total_seats } = req.body;
        const newTrain = await pool.query(
            'INSERT INTO trains (name, source, destination, total_seats, available_seats) VALUES ($1, $2, $3, $4, $4) RETURNING *',
            [name, source, destination, total_seats]
        );
        res.status(201).json(newTrain.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/availability', async (req, res) => {
    try {
        const { source, destination } = req.query;
        const trains = await pool.query(
            'SELECT * FROM trains WHERE source = $1 AND destination = $2 AND available_seats > 0',
            [source, destination]
        );
        res.json(trains.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.delete('/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM trains WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Train not found' });
        }
        res.json({ message: 'Train deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.patch('/:id/seats', authenticateAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { id } = req.params;
        const { total_seats } = req.body;
        
        
        const bookingsCount = await client.query(
            'SELECT COUNT(*) FROM bookings WHERE train_id = $1',
            [id]
        );
        
        
        if (total_seats < parseInt(bookingsCount.rows[0].count)) {
            throw new Error('Cannot reduce seats below current bookings');
        }
        
        const updatedTrain = await client.query(
            `UPDATE trains 
             SET total_seats = $1, 
                 available_seats = $1 - (total_seats - available_seats)
             WHERE id = $2 
             RETURNING *`,
            [total_seats, id]
        );
        
        await client.query('COMMIT');
        res.json(updatedTrain.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

module.exports = router;