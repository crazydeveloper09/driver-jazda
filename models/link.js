const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema({
    title: String,
    href: String
})

module.exports = mongoose.model("Link", linkSchema);
