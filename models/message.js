const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
   
    text: String,
    subpage: 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subpage"
    }
    
});

module.exports = mongoose.model("Message", messageSchema);