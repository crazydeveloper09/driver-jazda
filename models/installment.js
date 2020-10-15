const mongoose = require("mongoose");

const installmentSchema = new mongoose.Schema({
    amount: Number
})

module.exports = mongoose.model("Installment", installmentSchema);