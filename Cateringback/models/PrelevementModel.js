const mongoose=require("mongoose");
const prelevementSchem=new mongoose.Schema({
    personnel:{
        type: String,
        required: true
    },
    dateDebut:{
        type: Date,
        required:true        
    },
    dateFin:{
        type: Date,
        required: true
    },
    montantTotal:{
        type: Number, 
        required:true
    },
    annulation: { 
        type: Boolean,
        default: false
    }
})
module.exports = mongoose.model("Prelevement", prelevementSchem);