import React, { useState } from 'react';
import Register from "./components/registerForm"; // Import your form component

const Home = () => {
    // 1. Initialize state to control the form's visibility
    const [isRegisterVisible, setIsRegisterVisible] = useState(false);
    
    // You'll likely need to manage the Login form visibility as well
    const [isLoginVisible, setIsLoginVisible] = useState(false);

    // 2. Click handler to toggle visibility
    const handleRegisterClick = () => {
        // Hide the login form if it was open
        setIsLoginVisible(false); 
        // Show/toggle the register form
        setIsRegisterVisible(prev => !prev); 
    };


const handleLoginClick = () => {
        setIsRegisterVisible(false);
        setIsLoginVisible(prev => !prev);
    };

    return(
        <>
            <div id="homeImageContainer" className="home">
                <h3 ></h3>
                <div id="homeContentContainer">
                    <h2 className="h2">Welcome to EduBridge-Kenya</h2>
                    <p className="h2p">Where excelling outside classroom is even simpler.</p>
    <br />
                    <p>This is a platform built to help students and scholars connect with mentors, learning resources and career support all in one place</p>
                <button className="signInButton" onClick={handleLoginClick}>Sign In</button>
                <button className="signInButton" onClick={handleRegisterClick}>Get Started</button>
                    <p>It provides tools to mentor, share content and track progress for instructors.</p>
                    <p>For students, it offers amazing course work and guidance.</p>
                </div>
            </div>
            <div>
                {/* 5. Conditional Rendering */}
                {isRegisterVisible && (
                    <div className="form-modal"> 
                        <Register />
                    </div>
                )}
                
                {/* You would put the Login component here later */}
                {isLoginVisible && <Login />}
                
            </div>
        </>
    );
}

export default Home