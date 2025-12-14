const User = require('../models/userSchema');
const asyncHandler = require('express-async-handler');

const getAllUsers = asyncHandler(async (req, res) => {
    // Find all users, but exclude the password field
    const users = await User.find().select('-password'); 
    res.status(200).json(users);
});

module.exports = { getAllUsers };