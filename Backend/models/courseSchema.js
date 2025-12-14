const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {type : String, required: true},
    description : {type: String},
    instructor : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    price : {type : Number },
    courseStatus: { 
        type: String, 
        enum: ['draft', 'under_review', 'published', 'archived'], 
        default: 'draft' 
    }
}, { timestamps: true });

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;