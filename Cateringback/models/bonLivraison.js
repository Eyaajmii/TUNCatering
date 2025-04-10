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
    Statut:{
      type:String,
      enum: ["En attente", "En retard", "Annulé","Livré"],
      default: "En attente",
    },
    vol: {
      type: String,
      required: true,
    },
    volInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vol",
      required: false,
    },
    commandes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Commande",
        required: true,
      },
    ],
    personnelLivraison: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "personnelnavigant",
      required: false, 
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
