const mongoose = require ('mongoose');

const EnrollSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    },
    course : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Course',
        required : true
    },
    enrollmentDate : {
        type : Date,
        default : Date.now
    },
    status : {
        type :String,
        enum : ["Enrolled", "In-progress", "Completed"],
        default : "enrolled"
    }
});

// This ensures that the combination of user ID + course ID must be unique.
EnrollSchema.index({ user: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model("Enrollment", EnrollSchema);

module.exports = Enrollment;