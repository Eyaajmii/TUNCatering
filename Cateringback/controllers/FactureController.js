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

      const volnumero = vols.map((v) => v.numVol);
      //find all bn livraison include vols
      const bonsLivraison = await BonLivraison.find({
        vol: { $in: volnumero },
      }).populate({
        path: "commandes",
        populate: [
          { path: "menu", select: "nom" },
          { path: "plats", select: "nom" },
          { path: "MatriculePn", select: "Matricule" },
          { path: "MatriculeDirTunCater", select: "Matricule" },
        ],
      });
      //filtrer les bons non livré
      const bnNonLivre = bonsLivraison.filter((bn) => bn.Statut !== "Livré");

      if (bnNonLivre.length > 0) {
        const message = bnNonLivre
          .map((b) => `Bon ${b.numeroBon} non validé`)
          .join(", ");
        return { success: false, message };
      }

      const newFacture = new Facture({
        numeroFacture: "FCT-" + Date.now(),
        DateFacture: new Date(),
        Statut: "En attente",
        BonsLivraison: bonsLivraison.map((bn) => bn._id),
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

          let pn = null;
          if (commande.MatriculePn) {
            pn = commande.MatriculePn._id?.toString();
          } else if (commande.MatriculeDirTunCater) {
            pn = commande.MatriculeDirTunCater._id?.toString();
          }

          if (pn) {
            montantPN.set(pn, (montantPN.get(pn) || 0) + montant);
          }
        }

        montantParVol.push({
          vol: bn.volInfo,
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
}

module.exports = FactureController;
