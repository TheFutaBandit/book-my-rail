const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Book a seat
router.post('/', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN'); // Start transaction
        
        const { train_id } = req.body;
        const user_id = req.user.id;
        
        // Check seat availability with lock
        const trainResult = await client.query(
            'SELECT available_seats FROM trains WHERE id = $1 FOR UPDATE',
            [train_id]
        );
        
        if (trainResult.rows.length === 0) {
            throw new Error('Train not found');
        }
        
        const train = trainResult.rows[0];
        if (train.available_seats <= 0) {
            throw new Error('No seats available');
        }
        
        // Create booking
        const seatNumber = await client.query(
            'SELECT COALESCE(MAX(seat_number), 0) + 1 as next_seat FROM bookings WHERE train_id = $1',
            [train_id]
        );
        
        const booking = await client.query(
            'INSERT INTO bookings (user_id, train_id, seat_number) VALUES ($1, $2, $3) RETURNING *',
            [user_id, train_id, seatNumber.rows[0].next_seat]
        );
        
        // Update available seats
        await client.query(
            'UPDATE trains SET available_seats = available_seats - 1 WHERE id = $1',
            [train_id]
        );
        
        await client.query('COMMIT');
        res.status(201).json(booking.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Get booking details
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const booking = await pool.query(
            `SELECT b.*, t.name as train_name, t.source, t.destination 
             FROM bookings b 
             JOIN trains t ON b.train_id = t.id 
             WHERE b.id = $1 AND b.user_id = $2`,
            [req.params.id, req.user.id]
        );
        
        if (booking.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        res.json(booking.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;