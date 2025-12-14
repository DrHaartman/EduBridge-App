// middleware/errorMiddleware.js

// Handles routes that don't exist (404 Not Found)
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Generic error handler that formats the response
const errorHandler = (err, req, res, next) => {
    // If status code is 200 (OK), change it to 500 (Server Error)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        // Only include stack trace if in development mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = {
    notFound,
    errorHandler,
};