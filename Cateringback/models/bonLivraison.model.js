const mongoose = require("mongoose");

const bonLivraisonSchema = new mongoose.Schema(
  {
    numeroBon: {
      type: String,
      required: true,
      unique: true,
    },
    dateCreation: {
      type: Date,
      default: Date.now,
    },
    vol: { 
        type: String,  // Gardez le type String
        required: true 
    },
    // Ajoutez ce champ pour faciliter les requêtes
    volInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vol",
        required: false
    },
    commandes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Commande",
        required: true
    }],
    personnelLivraison: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PersonnelNavigant",
        required: false,  // Rendre ce champ optionnel
      },
      

    signatureResponsable: {
      type: String,
    },
    dateLivraison: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("BonLivraison", bonLivraisonSchema);
