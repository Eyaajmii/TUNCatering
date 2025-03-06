const mongoose = require("mongoose");

const stockSchema= new mongoose.Schema({
    Quantite:{
        type:Number,
        required:true
    }
});
module.exports = mongoose.model("Stock", stockSchema);