const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
    text: String
});

module.exports = mongoose.model("Announcement", announcementSchema);