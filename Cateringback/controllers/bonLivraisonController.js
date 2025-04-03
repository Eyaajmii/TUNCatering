// bonLivraison.controller.js
const BonLivraison = require('../models/bonLivraison');
const Commande = require('../models/Commande');

exports.creerBonLivraison = async (req, res) => {
  try {
    const { volId, notes, personnelLivraisonId } = req.body;
    
    // Vérifier si un bon existe déjà pour ce vol
    const existingBon = await BonLivraison.findOne({ vol: volId });
    if (existingBon) {
      return res.status(400).json({ 
        message: "Un bon de livraison existe déjà pour ce vol",
        bonId: existingBon._id
      });
    }
    
    // Récupérer les commandes du vol
    const commandes = await Commande.find({ 
      vol: volId,
      Statut: { $in: ["prêt", "en cours de préparation"] }
    });
    
    if (commandes.length === 0) {
      return res.status(400).json({ 
        message: "Aucune commande prête pour ce vol" 
      });
    }
    
    // Créer le bon de livraison
    const nouveauBon = await BonLivraison.create({
      vol: volId,
      commandes: commandes.map(c => c._id),
      personnelLivraison: personnelLivraisonId,
      notes,
      statut: "en préparation"
    });
    
    // Mettre à jour le statut des commandes
    await Commande.updateMany(
      { _id: { $in: commandes.map(c => c._id) } },
      { $set: { Statut: "en cours de livraison" } }
    );
    
    res.status(201).json(nouveauBon);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBonLivraison = async (req, res) => {
  try {
    const bon = await BonLivraison.findById(req.params.id);
    
    if (!bon) {
      return res.status(404).json({ message: "Bon de livraison non trouvé" });
    }
    
    res.status(200).json(bon);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};