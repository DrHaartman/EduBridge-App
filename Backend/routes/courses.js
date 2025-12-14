const express = require('express');
const router = express.Router();
const Course = require('../models/courseSchema'); 
const { protect } = require('../middleware/authMiddleware');       // For login check
const { authorize } = require('../middleware/roleMiddleware');      // For role check

// @desc    Get all courses (list)
// @route   GET /api/courses
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Fetch only 'published' courses for public view
        const courses = await Course.find({ courseStatus: 'published' })
            .populate('instructor', 'name email') // Fetch instructor details
            .select('-__v') // Exclude Mongoose version key
            .sort({ createdAt: -1 }); // Show newest first

        res.status(200).json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error while fetching courses.' });
    }
});

// @desc    Get single course details
// @route   GET /api/courses/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name email');

        if (!course) {
            return res.status(404).json({ message: 'Course not found.' });
        }
        
        // OPTIONAL: You might restrict viewing of 'draft' courses to the owner/admin here
        if (course.courseStatus !== 'published' && req.user && req.user._id.toString() !== course.instructor.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'This course is not published yet.' });
        }

        res.status(200).json(course);
    } catch (error) {
        if (error.kind === 'ObjectId') { 
            return res.status(400).json({ message: 'Invalid Course ID format.' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server Error while fetching course.' });
    }
});


// --- PRIVATE ROUTES (CRUD Operations) ---

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Instructors and Admins only)
router.post('/', protect, authorize('admin', 'instructor'), async (req, res) => {
    const { title, description, price, duration } = req.body;
    
    if (!title || !description || !price) {
        return res.status(400).json({ message: 'Please include title, description, and price.' });
    }

    try {
        const course = await Course.create({
            title,
            description,
            price,
            duration,
            instructor: req.user._id, // Set the logged-in user as the instructor
            courseStatus: 'draft' 
        });

        res.status(201).json(course);

    } catch (error) {
        if (error.code === 11000) { 
            return res.status(400).json({ message: 'A course with this title already exists.' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server Error: Could not create course.' });
    }
});


// @desc    Update an existing course by ID
// @route   PUT /api/courses/:id
// @access  Private (Owner/Instructor or Admin only)
router.put('/:id', protect, authorize('admin', 'instructor'), async (req, res) => {
    const courseId = req.params.id;
    const { title, description, price, duration, courseStatus } = req.body;
    const userId = req.user._id;
    const allowedStatuses = ['draft', 'under_review', 'published', 'archived']; // Defined here for validation

    try {
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found.' });
        }

        // Ownership and Role Check
        const isOwner = course.instructor.toString() === userId.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to update this course.' });
        }
        
        // Update fields if provided
        course.title = title || course.title;
        course.description = description || course.description;
        course.price = price || course.price;
        course.duration = duration || course.duration;
        
        // Status Update and Validation
        if (courseStatus) {
            if (!allowedStatuses.includes(courseStatus)) {
                return res.status(400).json({ 
                    message: `Invalid course status provided. Must be one of: ${allowedStatuses.join(', ')}` 
                });
            }
            course.courseStatus = courseStatus;
        }

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


// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (Owner/Instructor or Admin only)
router.delete('/:id', protect, authorize('admin', 'instructor'), async (req, res) => {
    const courseId = req.params.id;
    const userId = req.user._id;

    try {
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found.' });
        }

        // Ownership and Role Check
        const isOwner = course.instructor.toString() === userId.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this course.' });
        }
        
        // Note: You should consider deleting all associated Enrollments and Content (lessons, quizzes) 
        // before deleting the course itself. This is called 'cascade delete' logic.

        await course.deleteOne(); // Or findByIdAndDelete(courseId);

        res.status(200).json({ message: 'Course successfully deleted.' });

    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Course ID format.' });
        }
        res.status(500).json({ message: 'Server Error while deleting course.' });
    }
});

module.exports = router;