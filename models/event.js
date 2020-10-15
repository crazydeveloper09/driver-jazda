const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    city: String,
    time: String,
    date: String,
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Course"
    },
    type: String
});

module.exports = mongoose.model("Event", eventSchema);