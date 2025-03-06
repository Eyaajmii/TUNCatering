const mongoose=require('mongoose');

const commandeSchema = new mongoose.Schema({
    NombreCommande:{
        type:Number,
        required:true
    },
    Statut:{
        type:String,
        enum:["En attente","En cours de préparation","Traité","Annulé","En retard","Livré"],
        default:"En attente"
    },
});
module.exports = mongoose.model("Commande", commandeSchema);