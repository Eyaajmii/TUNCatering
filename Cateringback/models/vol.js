const mongoose = require("mongoose");

const volSchema = new mongoose.Schema({
    numVol:{
        type:Number,
        required:true
    },
    volName:{
        type:String,
        required:true
    },
    Destination:{
        type:String,
        required:true
    },
    DureeVol:{
        type:String,
        required:true
    },
    dateVolDep:{
        type:Date,
        required:true
    },
    Escale:{
        type:Boolean,
        defaut:false
    },
    personnels:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"personnelnavigant"
    }]
});
module.exports = mongoose.model("vol", volSchema);