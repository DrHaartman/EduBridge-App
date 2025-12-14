const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userSchema');

const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_FALLBACK_SECRET'; 

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // 1. Check if the Authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (it's in the format "Bearer TOKEN", we take the second part [1])
            token = req.headers.authorization.split(' ')[1]; 
            
            // 2. Verify the token using the secret key
            const decoded = jwt.verify(token, JWT_SECRET); 
            
            // 3. Find the user ID from the decoded payload (decoded.id)
            //    and attach the user object (excluding the password) to the request object.
            req.user = await User.findById(decoded.id).select('-password'); 

            if (!req.user) {
                 res.status(401);
                 throw new Error('Not authorized, user not found');
            }

            // Move to the next middleware or route handler
            next();

        } catch (error) {
            console.error("JWT Verification Error:", error.message);
            // If verification fails (e.g., expired, wrong secret), send 401
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token provided');
    }
});

module.exports = { protect };