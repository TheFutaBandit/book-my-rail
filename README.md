# book-my-rail
A REST-API for managing a railway system

## Features
1. User Authentication
2. Role-based Access
3. Seat Availability checking
4. Train Management
5. Secure booking system with race condition handling
6. Rate Limiting

## tech-stack used
- Node.js (v14 or higher)
- PostgreSQL
- Redis
- Ubuntu/WSL2 environment

## Installation
1. To install, clone the repository on your local ubuntu environment
```bash
git clone https://github.com/yourusername/book-my-rail.git
cd book-my-rail
```

2. Then Install the necessary dependencies:
```bash
npm install
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
sudo -i -u postgres
createuser --interactive --pwprompt
```

3. Install and setup redis server(Only for the purpose of setting up redlock)
```bash
sudo apt install redis-server
sudo service redis-server start
redis-cli ping
```

4. create a .env file pertaining to the details you enter for the database.
```bash
PORT=3000
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=irctc_db
JWT_SECRET=your_jwt_secret_key
ADMIN_API_KEY=your_admin_api_key
```

Initialize the databse:
```bash
npm run init-db
```

5. Start the server:
```bash
node src/index.js
```

## API Endpoints
"endpoints": {
"users": {
    "register": "POST /api/users/register", --- To Register the user/admin
    "login": "POST /api/users/login" --- To Login the user/admin
},
"trains": {
    "getAvailability": "GET /api/trains/availability", --- check train availability (user/admin)
    "addTrain": "POST /api/trains (Admin)", --- add trains (admin)
    "updateSeats": "PATCH /api/trains/:id/seats (Admin)", --- update seats in a train (admin)
    "deleteTrain": "DELETE /api/trains/:id (Admin)" --- delete a train (admin)
},
"bookings": {
    "createBooking": "POST /api/bookings", --- create booking (user/admin)
    "getBookingDetails": "GET /api/bookings/:id" --- get booking details (user/admin)
}
}

## ASSUMPTIONS AND LIMITATIONS
1. Cancellation not supported
2. Authentications token are permanent

## TO TEST THE API
--Register the user
curl -X POST http://localhost:3000/api/users/register \
-H "Content-Type: application/json" \
-d '{"username":"testuser", "password":"testpass"}'

--Login the user
curl -X POST http://localhost:3000/api/users/register \
-H "Content-Type: application/json" \
-d '{"username":"testuser", "password":"testpass"}'

--Add a train(Admin)
curl -X POST http://localhost:3000/api/trains \
-H "Content-Type: application/json" \
-H "x-api-key: your_admin_api_key" \
-d '{"name":"Express 123", "source":"Delhi", "destination":"Mumbai", "total_seats":100}'

--check availability 
curl "http://localhost:3000/api/trains/availability?source=Delhi&destination=Mumbai"'

--Book a seat
curl -X POST http://localhost:3000/api/trains \
-H "Content-Type: application/json" \
-H "Authorization: Bearer your_jwt_token" \
-d '{"train_id":1}'
