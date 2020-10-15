const mongoose = require("mongoose");

const pictureSchema = new mongoose.Schema({
   
    link: String
    
});

module.exports = mongoose.model("Picture", pictureSchema);