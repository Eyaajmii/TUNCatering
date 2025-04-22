const mongoose=require("mongoose");
const prelevementSchem=new mongoose.Schema({
    personnel:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"personnelnavigant",
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
    }
})
module.exports = mongoose.model("Prelevement", prelevementSchem);