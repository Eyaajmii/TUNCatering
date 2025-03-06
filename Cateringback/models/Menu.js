const mongoose=require('mongoose');

const menuSchema=new mongoose.Schema({
    nom:{
        type:String,
        required:true
    },
    Rotation:{
        type:String,
        enum:["Matin","Midi","Soir"],
        required:true
    },
    typeMenu:{
        type:String,
        enum:["Standard","Végétarien","Sans gluten"],
        required:true
    },
    Plats:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Meal"
    }]
});
module.exports = mongoose.model("Menu", menuSchema);
