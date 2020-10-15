const mongoose = require("mongoose");

const listElementSchema = new mongoose.Schema({
   
    text: String,
    
    list: 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "List"
    }
    
});

module.exports = mongoose.model("ListElement", listElementSchema);