const express = require('express');
const router = express.Router();
const Enrollment = require('../models/enrollment'); // Your Enrollment Model
const Course = require('../models/courseSchema');
const { protect } = require('../middleware/authMiddleware'); // For authentication
const { authorize } = require('../middleware/roleMiddleware'); // <--- THIS LINE IS MISSING OR INCORRECT

// Enroll the logged-in user into a course
// Route   POST /api/enroll. access is Private
router.post('/', protect, async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user._id; // User ID comes from the 'protect' middleware

    // 1. Basic Input Validation
    if (!courseId) {
        return res.status(400).json({ message: 'Course ID is required for enrollment.' });
    }

    try {
        // 2. Verify Course Existence and Status (Ensure it's published)
        const course = await Course.findById(courseId);
        if (!course || course.courseStatus !== 'published') {
            return res.status(404).json({ message: 'Course not found or is not currently available for enrollment.' });
        }

        // 3. Check for Existing Enrollment
        // This is a secondary check, as the unique index on the schema will also catch it.
        const existingEnrollment = await Enrollment.findOne({ 
            user: userId, 
            course: courseId 
        });

        if (existingEnrollment) {
            return res.status(400).json({ message: 'You are already enrolled in this course.' });
        }

        // 4. Create the Enrollment Record
        const newEnrollment = await Enrollment.create({
            user: userId,
            course: courseId,
            // enrollmentDate and completionStatus will use their schema defaults
        });

        // 5. Success Response
        const enrollment = await newEnrollment.populate('course', 'title instructor');

        res.status(201).json({
            message: 'Enrollment successful!',
            enrollment: enrollment
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error during enrollment process.' });
    }
});


// Get all courses the logged-in user is enrolled in
router.get('/my-courses', protect, async (req, res) => {

    const userId = req.user._id;

    try {
        // Find all Enrollment records where the 'user' field matches the logged-in user's ID
        const enrollments = await Enrollment.find({ user: userId })
            // Use populate to fetch the actual course data (title, description, etc.)
            .populate('course', 'title description price instructor courseStatus') 
            // Also populate the instructor's name/email from the User model (via the Course model)
            .populate({
                path: 'course',
                populate: {
                    path: 'instructor',
                    select: 'name email' // Fetch only the name and email of the instructor
                }
            })
            // Sort by enrollment date (newest first)
            .sort({ enrollmentDate: -1 }); 

        if (!enrollments || enrollments.length === 0) {
            return res.status(200).json({ 
                message: 'You are not currently enrolled in any courses.', 
                enrollments: [] 
            });
        }

        res.status(200).json(enrollments);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error while fetching your enrolled courses.' });
    }
});


// Update an existing course by ID
// @access  Private (Owner/Instructor or Admin only)

router.put('/:id', protect, authorize('admin', 'instructor'), async (req, res) => {
    const courseId = req.params.id;
    const { title, description, price, duration, courseStatus } = req.body;
    const userId = req.user._id;

    try {
        // 1. Find the course
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found.' });
        }

        // 2. Ownership Check (Crucial step!)
        // Check if the logged-in user is the course instructor OR an Admin
        const isOwner = course.instructor.toString() === userId.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            // Forbidden
            return res.status(403).json({ message: 'Forbidden: You do not have permission to update this course.' });
        }
        
        // 3. Update fields only if they are provided
        course.title = title || course.title;
        course.description = description || course.description;
        course.price = price || course.price;
        course.duration = duration || course.duration;
        
        // Allow updating status only if a specific status is provided
        if (courseStatus) {
            const allowedStatuses = ['draft', 'under_review', 'published', 'archived'];

                    // Check if the received status is NOT in the allowed list
                if (!allowedStatuses.includes(courseStatus)) {
                   return res.status(400).json({ 
                   message: `Invalid course status provided. Must be one of: ${allowedStatuses.join(', ')}` 
               });
                  }
              course.courseStatus = courseStatus;
        }


        // 4. Save the updated course
        const updatedCourse = await course.save();

        res.status(200).json(updatedCourse);

    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Course ID format.' });
        }
        res.status(500).json({ message: 'Server Error while updating course.' });
    }
});


// Unenroll a user from a course
// DELETE /api/enroll/:courseId, access  Private
router.delete('/:courseId', protect, async (req, res) => {
    const courseId = req.params.courseId;
    const userId = req.user._id;

    try {
        // 1. Find and delete the enrollment record
        const result = await Enrollment.findOneAndDelete({
            user: userId, // Match the logged-in user
            course: courseId // Match the course ID from the URL parameter
        });

        if (!result) {
            // If nothing was deleted, the enrollment didn't exist for this user/course combo
            return res.status(404).json({ 
                message: 'Enrollment not found. You may not be enrolled in this course.' 
            });
        }

        // 2. Success response
        res.status(200).json({ 
            message: `Successfully unenrolled from course ID: ${courseId}` 
        });

    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Course ID format.' });
        }
        res.status(500).json({ message: 'Server Error while processing unenrollment.' });
    }
});

module.exports = router;