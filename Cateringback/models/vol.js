const mongoose = require("mongoose");

const volSchema = new mongoose.Schema({
    numVol:number,
    volName:String,
    volDesc:String,
});
module.exports = mongoose.model("vol", volSchema);