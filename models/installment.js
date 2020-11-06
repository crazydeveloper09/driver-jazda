const mongoose = require("mongoose");

const installmentSchema = new mongoose.Schema({
    amount: Number,
    description: String
})

module.exports = mongoose.model("Installment", installmentSchema);