const mongoose = require("mongoose");

const stockSchema= new mongoose.Schema({
    Quantite:{
        type:Number,
        required:true
    },
    Menu:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Menu"
    }
});
module.exports = mongoose.model("Stock", stockSchema);