const mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

const driverSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    email: String,
    phone: String,
    carOffices: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Office"
        }
    ],
    motorcycleOffices: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Office"
        }
    ],
    pictures: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Picture"
        }
    ]
});
driverSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Driver", driverSchema);