const express = require('express');
const router = express.Router();
const User = require('../models/userSchema'); 
const generateToken = require('../utils/generateToken');
const { getAllUsers } = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // For authentication
const { authorize } = require('../middleware/roleMiddleware'); // for role placement


// 1. CREATING A NEW USER.
router.post("/register", async (req, res) => {
    console.log("--- 1. Route Handler Entered ---"); // <-- START
    const { name, email, password, role, department, gradeLevel } = req.body;

    // ... (Your existing validation checks) ...

    try {
        console.log("--- 3. Entered Try Block ---"); 
        const userExists = await User.findOne({ email });

        // ... (Your existing user exists check) ...

        const user = await User.create({ 
            name, email, password,
            role: role || 'student',
            department, gradeLevel
        });

        console.log("--- 5. User Created Successfully ---"); // <-- IF CRASH IS HERE, IT'S THE JWT or BCRYPT

        if (user) {
            // This is the line that uses the external utility
            const token = generateToken(user._id); 
            
            console.log("--- 6. Token Generated ---"); 

            res.status(201).json({
                // ... response data ...
                token, 
            });
        } 
        
    } catch (error) {
        // This is the block that is failing to execute/log right now
        console.log("--- X. CRASH OCCURRED ---"); 
        console.error("FULL ERROR OBJECT:", error); 
        res.status(500).json({ message: 'Server Error during registration.' });
    }
});

// 1.b AUTHENTICATE A USER (LOGIN)
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // 1. Find the user by email
    const user = await User.findOne({ email });

    // 2. Check if user exists AND if the password matches
    if (user && (await user.matchPassword(password))) {
        // 3. Send Success Response and JWT
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id), // Generate and send the JWT
        });
    } else {
        // Handle failure: Either user not found or password incorrect
        res.status(401).json({ message: 'Invalid email or password.' });
    }
});

// 1.c GET USER PROFILE (Protected Route)
// URL: /api/users/profile
router.get("/profile", protect, (req, res) => {
    // If the request reaches this point, the 'protect' middleware has run
    // successfully, and 'req.user' will contain the user object from the DB.
    
    // We can then safely send the profile data
    res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        department: req.user.department,
        gradeLevel: req.user.gradeLevel,
    });
});

// 2. UPDATE USER DETAILS.
router.put('/me', protect, async (req, res) => {
    // req.user is available here from the 'protect' middleware
    const user = req.user; 
    
    // 1. Update basic fields if they are provided in the request body
    if (req.body.name) {
        user.name = req.body.name;
    }
    if (req.body.email) {
        // You may want additional logic here to verify the new email is unique
        user.email = req.body.email;
    }

    // 2. Handle Password Update (if provided)
    if (req.body.password) {
        // Since we are using the pre-save hook in the UserSchema, 
        // assigning the new password here will automatically trigger hashing upon .save()
        user.password = req.body.password; 
    }

    try {
        const updatedUser = await user.save();
        
        // Return updated data password EXCLUDED.
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        });

    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message || 'Error updating user profile.' });
    }
});

// 3. DELETE USER'S PROFILE BY ID
router.delete('/me', protect, async (req, res) => {
    // req.user is available and represents the logged-in user
    const userId = req.user._id; 

    if (req.user.role === 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admins must be deleted by another administrator.' });
    }

    try {
        const result = await User.findByIdAndDelete(userId);

        if (!result) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ message: 'User account successfully removed.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error during account deletion.' });
    }
});

// 4. Read self profile.
// access is private (Requires a valid JWT token)
router.get('/me', protect, async (req, res) => {

    // We simply return the data stored in req.user
    if (req.user) {
        res.status(200).json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
        });
    } else {
        // This case should ideally be caught by the 'protect' middleware, but acts as a final safeguard.
        res.status(404).json({ message: 'User data not found.' });
    }
});

// 5. READ users(for admin) profile.roleMiddleware.js

// route   GET /api/users/:id, access  Private (teacher, admin)
router.get('/:id', protect, authorize('admin', 'instructor'), async (req, res) => {
    // If the code reaches here, the user is logged in AND is either an 'admin' or 'instructor'
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid User ID format.' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server Error while fetching user.' });
    }
});

//  Admin approval to change another user's role
//  PUT /api/users/approve-role/:id
// Private (Admin Only)
router.put('/approve-role/:id', protect, authorize('admin'), async (req, res) => {
    const targetId = req.params.id;
    const { newRole } = req.body; // Expects 'instructor' or 'admin'
    
    const allowedNewRoles = ['instructor', 'admin'];

    if (!newRole || !allowedNewRoles.includes(newRole)) {
        return res.status(400).json({ message: 'Invalid or missing new role for approval.' });
    }

    try {
        const targetUser = await User.findById(targetId).select('-password');

        if (!targetUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Set the new role
        targetUser.role = newRole;
        await targetUser.save();

        res.status(200).json({ 
            message: `User ${targetUser.email} role updated to ${newRole}.`,
            user: { _id: targetUser._id, name: targetUser.name, role: targetUser.role }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error during role update.' });
    }
});

//  Admin/Instructor delete any user account
//  Private (Admin or Instructor)
router.delete('/:id', protect, authorize('admin', 'instructor'), async (req, res) => {
    const targetId = req.params.id;
    const callerRole = req.user.role;
    
    try {
        const targetUser = await User.findById(targetId);

        if (!targetUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Deletion Hierarchy Checks
        if (targetUser.role === 'admin' && callerRole !== 'admin') {
            return res.status(403).json({ message: 'Only an Admin can delete another Admin.' });
        }
        if (targetUser.role === 'instructor' && callerRole !== 'admin') {
            return res.status(403).json({ message: 'Only an Admin can delete an Instructor.' });
        }
        if (targetUser.role === 'student' && !['admin', 'instructor'].includes(callerRole)) {
            return res.status(403).json({ message: 'Only an Admin or Instructor can delete a Student.' });
        }
        
        // Final Deletion
        await targetUser.deleteOne();

        res.status(200).json({ message: `User (${targetUser.role}) successfully deleted.` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error during user deletion.' });
    }
});

// New Route: GET /api/users (Requires Instructor/Admin role)
router.get('/', protect, authorizeRoles('admin', 'instructor'), getAllUsers); 


module.exports = router;