# Backend Server

This is the Node.js/Express backend for the Bloop application.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (Local or Atlas)

## Setup

1. **Install Dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the `server` directory (already created) with the following content:
   ```env
   MONGO_URI=mongodb://localhost:27017/bloop
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   ```
   *Note: If you are using MongoDB Atlas, replace `mongodb://localhost:27017/bloop` with your connection string.*

3. **Start the Server**:
   ```bash
   node server.js
   ```
   Or for development with auto-restart (requires nodemon):
   ```bash
   npx nodemon server.js
   ```

## API Endpoints

- **POST /api/auth/signup**: Register a new user.
  - Body: `{ "username": "test", "email": "test@test.com", "password": "password" }`
- **POST /api/auth/login**: Login existing user.
  - Body: `{ "email": "test@test.com", "password": "password" }`
