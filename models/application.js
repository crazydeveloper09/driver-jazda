const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    name: String,
    phone: Number,
    email: String,
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Event"
    },
    isApplicated: Boolean
    
});

module.exports = mongoose.model("Application", applicationSchema);
