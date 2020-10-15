const mongoose = require("mongoose");

const listSchema = new mongoose.Schema({
   
    title: String,
    elements: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ListElement"
        }
    ],
    
    subpage: 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subpage"
    }
    
});

module.exports = mongoose.model("List", listSchema);