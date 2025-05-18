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
    Statut: {//par chef de cabine
      type: String,
      enum: ["En attente", "En retard", "Annulé", "Livré"],
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
      type: String,
    },

    signatureResponsable: {
      type: String,
    },
    dateLivraison: {
      type: Date,
    },
    conformite: {//conformite par tunisie catering
      type: String,
      enum: ["Confirmé", "Non confirmé", "Non vérifié"],
      default: "Non vérifié",
    },
    qrCodeImage: {
      type: String, // base64 ou chemin vers fichier
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("BonLivraison", bonLivraisonSchema);
