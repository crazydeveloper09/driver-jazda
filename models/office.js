const mongoose = require("mongoose");

let officeSchema = new mongoose.Schema({
    name: String,
    what: String,
    additional: String,
    postalCode: String,
    city: String,
    location: String,
    openingHours: String,
    street: String,
    lat: Number,
    lng: Number
})

module.exports = mongoose.model("Office", officeSchema)