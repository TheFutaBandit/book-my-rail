const { rateLimit } = require('express-rate-limit');


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    limit: 100,
    message: 'Too many requests from this IP, please try again later.'
});


const bookingLimiter = rateLimit({
    windowMs: 60 * 1000, 
    limit: 5,
    message: 'Too many booking attempts, please try again after a minute.'
});

module.exports = { limiter, bookingLimiter };