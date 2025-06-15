const Facture = require("../models/FactureModel");
const BonLivraison = require("../models/bonLivraison");
const Vol = require("../models/vol");

class FactureController {
  static async creerFacture(dateDebut, dateFin) {
    try {
      if (!dateDebut || !dateFin) {
        throw new Error("Veuillez fournir les deux dates de début et de fin.");
      }
      const DebutDate = new Date(dateDebut);
      const FinDateChoisie = new Date(dateFin);
      FinDateChoisie.setHours(23, 59, 59, 999); 
       const factureAvecMemePeriode = await Facture.findOne({
         "DureeFacture.dateDebut": { $eq: DebutDate },
         "DureeFacture.dateFin": { $eq: FinDateChoisie },
         Statut: { $ne: "annulé" },
       });

       if (factureAvecMemePeriode) {
         throw new Error("Une facture existe déjà pour cette période.");
       }
      const bonsNonValides = await BonLivraison.find({Statut: { $nin: ["Validé", "Annulé"] },dateCreation: { $gte: DebutDate, $lte: FinDateChoisie },});
      if (bonsNonValides.length > 0) {
        throw new Error( "Impossible de générer la facture : certains bons dans cette période ne sont pas encore validés.");
      }
      let bonsLivraison = await BonLivraison.find({
        Facturé: false,
        Statut: "Validé",
        dateCreation: { $gte: DebutDate, $lte: FinDateChoisie },
      }).populate({
        path: "commandes.commande",
        select: "montantsTotal Matricule",
      });

      if (bonsLivraison.length === 0) {
        throw new Error("Aucun bon de livraison éligible dans cette période.");
      }

      const maxDate = new Date(
        Math.max(...bonsLivraison.map((b) => b.dateCreation.getTime()))
      );

      const bonsIds = bonsLivraison.map((bn) => bn._id);

      const factureExistante = await Facture.findOne({
        BonsLivraison: { $in: bonsIds },
        Statut: { $ne: "annulé" },
      });

      if (factureExistante) {
        throw new Error(
          "Certains bons de livraison sont déjà inclus dans une facture non annulée."
        );
      }
      const newFacture = new Facture({
        numeroFacture: "FCT-" + Date.now(),
        DateFacture: new Date(),
        Statut: "en attente",
        BonsLivraison: bonsIds,
        DureeFacture: [
          {
            dateDebut: DebutDate,
            dateFin: maxDate,
          },
        ],
      });

      // Calcul des montants
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

      newFacture.montantTotal = montantTotal;
      newFacture.montantParVol = montantParVol;
      newFacture.montantParPn = Array.from(montantPN.entries()).map(
        ([personnel, montant]) => ({ personnel, montant })
      );

      await newFacture.save();
      await BonLivraison.updateMany(
        { _id: { $in: bonsIds } },
        { $set: { Facturé: true } }
      );

      console.log("Facture générée :", newFacture);
      return { success: true, data: newFacture };
    } catch (err) {
      throw err;
    }
  }

  static async TousLesFacture() {
    try {
      const factures = await Facture.find();
      console.log("factures récupérées:", factures);
      return factures;
    } catch {
      console.error("Erreur dans TousLesFacture");
    }
  }
  //Tunisiar update status and catering annule facture
  static async updateFactureStatus(id, newStatus) {
    try {
      const facture = await Facture.findById(id);
      if (facture.Statut !== "en attente") {
        throw new Error("Seules les factures en attente peuvent être annulées");
      }
      const updateFact = await Facture.findByIdAndUpdate(
        id,
        { Statut: newStatus },
        { new: true, runValidators: true }
      );
      if (!updateFact) {
        throw new Error("Aucune facture trouvé! ");
      }
      return updateFact;
    } catch (err) {
      throw err;
    }
  }
  static async AnnulerFacture(id) {
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
  static async consulterDetailFacture(id) {
    try {
      const facture = await Facture.findById(id).populate("BonsLivraison");
      return facture;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = FactureController;
