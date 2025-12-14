const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/connectdb');
const { notFound, errorHandler } = require('./middleware/errorMiddleware'); // Global error handling
// Import Routers
const userRoutes = require('./routes/user');
const courseRoutes = require('./routes/courses');
const enrollmentRoutes = require('./routes/Enrollment');

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB(); 

const app = express();

// 2. GLOBAL MIDDLEWARE

app.use(express.json());
// Allows accepting form data (if needed)
app.use(express.urlencoded({ extended: false }));


// 3. ROOT ROUTE
// Simple root route to verify the API is running
app.get('/', (req, res) => {
    res.send('EDUBRIDGE API is running successfully!');
});


// 4. ROUTE MOUNTING
// Mount the specific routers we've built
// The paths here define the base URL segment (e.g., /api/users, /api/courses)
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enroll', enrollmentRoutes);


// 5. GLOBAL ERROR HANDLING MIDDLEWARE
// These MUST be placed after the route mounting
// Custom 404 handler for routes not found
app.use(notFound);
// Custom error handler (overrides default Express error handling)
app.use(errorHandler);


// 6. SERVER STARTUP
const PORT = process.env.PORT || 5000;

app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);