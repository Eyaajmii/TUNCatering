const Facture = require("../models/FactureModel");
const BonLivraison = require("../models/bonLivraison");
const Vol = require("../models/vol");

class FactureController {
  static async creerFacture(mois,annee) {
  try {
    if(!mois || mois<1 || mois>12){
      throw new Error("Mois invalide. Veuillez fournir un mois entre 1 et 12.");
    }
    annee=new Date().getFullYear();
    const DebutDate=new Date(annee,mois-1,1);
    const FinDate = new Date(annee, mois,0,23,59,59,999);
    const bonsLivraison = await BonLivraison.find({
      Facturé: false,
      Statut: "Validé",
      dateCreation: { $gte: DebutDate, $lte: FinDate },
    }).populate({
      path: "commandes.commande",
      select: "montantsTotal Matricule",
    });

    if (bonsLivraison.length === 0) {
      throw new Error("Aucun bon de livraison non facturé trouvé.");
    }
    const bonsIds = bonsLivraison.map((bn) => bn._id);

    const factureExistante = await Facture.findOne({
      BonsLivraison: { $in: bonsIds },
      Statut: { $ne: "annulé" },
    });

    if (factureExistante) {
      throw new Error ("Certains bons de livraison sont déjà inclus dans une facture active.");
    }
    const newFacture = new Facture({
      numeroFacture: "FCT-" + Date.now(),
      DateFacture: new Date(),
      Statut: "en attente",
      BonsLivraison: bonsIds,
    });

    let montantTotal = 0;
    const montantParVol = [];
    const montantPN = new Map();

    for (const bn of bonsLivraison) {
      let montantVol = 0;

      for (const item of bn.commandes) {
        const commande = item.commande;
        if (!commande) continue;

        const montant = commande.montantsTotal || 0;
        montantVol += montant;

        if (commande.Matricule) {
          montantPN.set(
            commande.Matricule,
            (montantPN.get(commande.Matricule) || 0) + montant
          );
        }
      }

      montantParVol.push({
        vol: bn.vol,
        montant: montantVol,
      });

      montantTotal += montantVol;
    }
    //stocke montant
    newFacture.montantTotal = montantTotal;
    newFacture.montantParVol = montantParVol;
    newFacture.montantParPn = Array.from(montantPN.entries()).map(
      ([id, montant]) => ({
        personnel: id,
        montant,
      })
    );    await newFacture.save();

    // Mettre à jour les bons comme facturés
    await BonLivraison.updateMany(
      { _id: { $in: bonsIds } },
      { $set: { Facturé: true } }
    );

    console.log("Facture générée :", newFacture);
    return { success: true, data: newFacture };

  } catch (err) {
    console.error("Erreur dans creerFactureSansDate:", err);
    throw err;
  }
}

  static async TousLesFacture(){
    try{
      const factures = await Facture.find();
      console.log("factures récupérées:", factures);
      return factures;
    }catch{
      console.error("Erreur dans TousLesFacture");
    }
  }
  //Tunisiar update status and catering annule facture
  static async updateFactureStatus(id,newStatus){
    try{
      const facture = await Facture.findById(id);
      if (facture.Statut!== "en attente") {
        throw new Error("Seules les factures en attente peuvent être annulées");
      }
      const updateFact = await Facture.findByIdAndUpdate(id, { Statut :newStatus},{new:true,runValidators:true});
      if(!updateFact){
        throw new Error("Aucune facture trouvé! ");
      }
      return updateFact;
    }catch(err){
      throw err;
    }
  }
  static async AnnulerFacture(id){
    try {
      const facture = await Facture.findById(id);
      if (facture.Statut !== "en attente") {
        throw new Error("Seules les factures en attente peuvent être annulées");
      }
      facture.Statut = "annulé"; 
      await facture.save();
    } catch (err) {
      throw err;
    }
  }
}

module.exports = FactureController;
