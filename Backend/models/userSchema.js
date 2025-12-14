const mongoose = require ('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name : {type: String, required : true },
    email :{type : String, required: true, unique: true},
    password : {type: String, required : true },
    role : {type : String, enum: [ 'student', 'instructor', 'admin'], default : "student", required : true },
    gradeLevel : {type : Number, required : function() {
        return this.role === 'student'
    }},
    department : { type : String, required : function() {
        return this.role === 'instructor'
    }}
}, { timestamps: true });

    // **KEY PART: Pre-save middleware/hook for hashing**
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) { // Only hash the password if it has been modified (or is new)
        return next();
    }
    
    // 1. Generate a salt (a random string to make the hash unique)
    const salt = await bcrypt.genSalt(10); // 10 is the recommended number of rounds
    
    // 2. Hash the password using the generated salt
    this.password = await bcrypt.hash(this.password, salt);
    
});

// **KEY PART: Method for comparing passwords**
UserSchema.methods.matchPassword = async function(enteredPassword) {
    // Compare the plain text password with the hashed password stored in the database
    return await bcrypt.compare(enteredPassword, this.password);
};


const User = mongoose.model("User", UserSchema);

module.exports = User;