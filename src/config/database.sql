CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS trains (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    source VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    total_seats INTEGER NOT NULL,
    available_seats INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    train_id INTEGER REFERENCES trains(id),
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    seat_number INTEGER NOT NULL
);