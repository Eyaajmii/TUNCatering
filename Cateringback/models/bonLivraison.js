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
    Statut: {
      type: String,
      enum: ["En attente", "Annulé", "Validé"],
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
        commande: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Commande",
          required: true,
        },
        confirme: {
          type: Boolean,
          default: false,
        },
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
    conformite: {
      //conformite par tunisie catering
      type: String,
      enum: ["Confirmé", "Non confirmé", "Non vérifié"],
      default: "Non vérifié",
    },
    qrCodeImage: {
      type: String, // base64 ou chemin vers fichier
    },
    Facturé: {
      type: Boolean,
      default: false,
    },
    Commantaire:{
      type:String
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("BonLivraison", bonLivraisonSchema);
