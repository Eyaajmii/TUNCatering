const Facture = require("../models/FactureModel");
const BonLivraison = require("../models/bonLivraison");
const Vol = require("../models/vol");

class FactureController {
  static async creerFacture(date) {
    try {
      if (!date) {
        throw new Error("Date requise");
      }
      //Extraire le debut et le fin du date pour avoir
      //tous les vols dans tous les heurs
      const parsedDate = new Date(date);
      const debut = new Date(parsedDate.setHours(0, 0, 0, 0));
      const fin = new Date(parsedDate.setHours(23, 59, 59, 999));

      const vols = await Vol.find({ dateVolDep: { $gte: debut, $lte: fin } });
      if (vols.length === 0) {
        throw new Error("Aucun vol trouvé à cette date");
      }
      const volNumero = vols.map((v) => v.numVol);
      //find all bn livraison include vols
      const bonsLivraison = await BonLivraison.find({
        vol: { $in: volNumero },
      }).populate({
        path: "commandes",
        select: "montantsTotal Matricule",
      });
      //filtrer les bons non livré
      const bnNonLivre = bonsLivraison.filter((bn) => bn.Statut !== "Livré");

      if (bnNonLivre.length > 0) {
        const message = bnNonLivre
          .map((b) => `Bon ${b.numeroBon} non validé`)
          .join(", ");
        return { success: false, message };
      }
      const existingFacture = await Facture.findOne({
        DateFacture: { $gte: debut, $lte: fin },
        Statut: { $ne: "annulé" },
      });
      if (existingFacture) {
        throw new Error("Un bon de livraison actif existe déjà pour ce vol");
      }
      const newFacture = new Facture({
        numeroFacture: "FCT-" + Date.now(),
        DateFacture: new Date(),
        Statut: "en attente",
        BonsLivraison: bonsLivraison.map((bn) => bn._id)
      });

      let montantTotal = 0;
      //srocker tous les monatnt par vol
      const montantParVol = [];
      //map pour prendre les montants par personnels
      const montantPN = new Map();
      //Calcule des montant
      for (const bn of bonsLivraison) {
        let montantVol = 0;

        for (const commande of bn.commandes) {
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
      //Save montants in the db
      newFacture.montantTotal = montantTotal;
      newFacture.montantParVol = montantParVol;
      newFacture.montantParPn = Array.from(montantPN.entries()).map(
        ([id, montant]) => ({
          personnel: id,
          montant,
        })
      );

      await newFacture.save();
      console.log("Facture générée :", newFacture);
      return { success: true, data: newFacture };
    } catch (err) {
      console.error("Erreur dans creerFacture:", err);
      return { success: false, message: err.message };
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
