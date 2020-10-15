const mongoose = require("mongoose");

const characteristicSchema = new mongoose.Schema({
    text: String
});

module.exports = mongoose.model("Characteristic", characteristicSchema);