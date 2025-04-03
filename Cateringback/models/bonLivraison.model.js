const mongoose = require('mongoose');

const bonLivraisonSchema = new mongoose.Schema({
  numeroBon: {
    type: String,
    required: true,
    unique: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  vol: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vol",
    required: true
  },
  commandes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Commande",
    required: true
  }],
  personnelLivraison: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PersonnelNavigant"
  },
  statut: {
    type: String,
    enum: ["en préparation", "prêt", "livré", "annulé"],
    default: "en préparation"
  },
  notes: {
    type: String,
    maxlength: 500
  },
  signatureResponsable: {
    type: String // Pour stocker une image/URL de signature
  },
  dateLivraison: {
    type: Date
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Population automatique
bonLivraisonSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'vol',
    select: 'numeroVol dateVol destination compagnie'
  })
  .populate({
    path: 'commandes',
    populate: [
      { path: 'menu', select: 'nom description' },
      { path: 'plats', select: 'nom description' },
      { path: 'MatriculePn', select: 'nom prenom matricule' }
    ]
  })
  .populate({
    path: 'personnelLivraison',
    select: 'nom prenom matricule'
  });
  
  next();
});

// Méthode pour générer le numéro de bon automatiquement
bonLivraisonSchema.pre('save', async function(next) {
  if (!this.numeroBon) {
    const count = await this.constructor.countDocuments();
    this.numeroBon = `BL-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model("BonLivraison", bonLivraisonSchema);