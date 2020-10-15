const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema({
    title: String,
    profile: String,
    pictures: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Picture"
        }
    ],
    type: String
})

module.exports = mongoose.model("Gallery", gallerySchema);