const mongoose = require ('mongoose');
require ('dotenv').config();

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGOATLAS_URI);
        console.log("MongoDB connected successfully...");

    } catch (error) {
        console.log("MongoDB failed to connect!");
    }
}

module.exports = connectDB;
