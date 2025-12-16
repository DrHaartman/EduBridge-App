// src/api/auth.js
import axios from 'axios';

// Create a custom instance of Axios if you didn't set up the proxy in vite.config.js,
// OR if you want a cleaner base URL.
const api = axios.create({
    // If you configured the proxy in vite.config.js, you can use a relative path:
    baseURL: 'http://localhost:5000/api/users'
    // If you did NOT configure the proxy, you must use the full URL:
    // baseURL: 'http://localhost:5000/api/users'
});

export const registerUser = async (userData) => {
    try {
        // This hits: POST /api/users/register
        const response = await api.post('/register', userData);
        return response.data;
    } catch (error) {
        // Return a clean error message from the backend
        throw error.response.data.message || 'Registration failed';
    }
};
// ... Login function will go here

// src/api/auth.js (Continue this file)

export const loginUser = async (credentials) => {
    try {
        // This hits: POST /api/users/login
        const response = await api.post('/login', credentials);
        
        // --- JWT STORAGE IS CRUCIAL ---
        const token = response.data.token;
        localStorage.setItem('jwtToken', token); // Store the token
        
        // You might also want to store user details (name, email, role)
        
        return response.data;
    } catch (error) {
        throw error.response.data.message || 'Login failed';
    }
};