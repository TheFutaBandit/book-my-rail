const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const { limiter, bookingLimiter } = require('./middleware/rateLimit');  
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const trainRoutes = require('./routes/trainRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();


app.use(cors());
app.use(express.json());


app.use(limiter);


app.use('/api/bookings', bookingLimiter);


app.get('/', (req, res) => {
    res.json({
        message: "Welcome to BookMyRail API!",
        endpoints: {
            users: {
                register: "POST /api/users/register",
                login: "POST /api/users/login"
            },
            trains: {
                getAvailability: "GET /api/trains/availability",
                addTrain: "POST /api/trains (Admin)",
                updateSeats: "PATCH /api/trains/:id/seats (Admin)",
                deleteTrain: "DELETE /api/trains/:id (Admin)"
            },
            bookings: {
                createBooking: "POST /api/bookings",
                getBookingDetails: "GET /api/bookings/:id"
            }
        }
    });
});


app.use('/api/users', userRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/bookings', bookingRoutes);


pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});


process.on('SIGTERM', () => {
    pool.end(() => {
        console.log('Database pool has ended');
        process.exit(0);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});