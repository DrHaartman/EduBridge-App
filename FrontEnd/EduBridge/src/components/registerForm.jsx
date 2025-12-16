// src/components/Register.jsx
import React, { useState } from 'react';
import { registerUser } from '../api/auth'; // Adjust the path if necessary

const Register = () => {
    // 1. STATE MANAGEMENT
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '',
        // Assuming your backend supports 'instructor' or 'student' roles
        role: 'student'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Handles input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 2. FORM SUBMISSION HANDLER
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); 
        setSuccess(false);
        setLoading(true);

        try {
            const data = await registerUser(formData);
            console.log('Registration Successful:', data);
            setSuccess(true);
            setFormData({ name: '', email: '', password: '', role: 'student' }); // Clear form
            // **TODO: Redirect user to the login page here**
        } catch (err) {
            // Error is caught from the 'throw' in your auth.js file
            setError(err); 
            console.error("Registration Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // 3. RENDER THE FORM
    return (
        <div className="register-container">
            <h2>Register for EduBridge</h2>
            {/* Display Feedback */}
            {loading && <p>Processing registration...</p>}
            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>Error: {error}</p>}
            {success && <p style={{ color: 'green', fontWeight: 'bold' }}>Success! Account created. Please log in.</p>}
            
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <label htmlFor="role-select">Account Type:</label>
                <select
                    id="role-select"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                </select>
                <button type="submit" disabled={loading}>
                    Register
                </button>
            </form>
        </div>
    );
};

export default Register;