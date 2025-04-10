const mongoose = require("mongoose");

const FactureSchema = new mongoose.Schema(
  {
    numeroFacture: {
      type: String,
      required: true,
      unique: true,
    },
    dateCreation: {
      type: Date,
      default: Date.now,
    },
    DateFacture: {
        type: Date,
        required: true
    },
    Statut: {
      type: String,
      enum: ["En attente", "Annulé", "Confirmé"],
      default: "En attente",
    },
    BonsLivraison:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bonLivraison'
    }],
    montantTotal: {
        type:Number,
        default:0,
    },
    montantParVol: [{
        vol:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'vol'
        },
        montant:Number
    }],
    montantParPn: [{
        peronnel:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'peronnelnavigant'
        },
        montant:Number,
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Facture", FactureSchema);
