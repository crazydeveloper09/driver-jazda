const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
   
    category: String,
    additionalPrice: Number,
    price: Number,
    
    characteristics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Characteristic"
    }],
    events: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Event"
        }
    ],
    type: String,
    sale: Number,
    installments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Installment"
        }
    ],
    pictures: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Picture"
        }
    ]
});

module.exports = mongoose.model("Course", courseSchema);