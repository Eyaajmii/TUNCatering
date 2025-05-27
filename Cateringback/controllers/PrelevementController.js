const prelevement = require("../models/PrelevementModel");
const facture = require("../models/FactureModel");

class PrelevementController {
  static async creerPrelevement(dateDebut, dateFin) {
    try {
      const debut = new Date(dateDebut);
      const fin = new Date(dateFin);
      fin.setHours(23, 59, 59, 999);

      const factures = await facture.find({
        DateFacture: { $gte: debut, $lte: fin },
        Statut: "confirmé",
        Preleve: false,
      });

      console.log("Nombre de factures trouvées :", factures.length);

      const mapMontants = new Map();

      for (const f of factures) {
        if (f.montantParPn && f.montantParPn.length > 0) {
          for (const m of f.montantParPn) {
            const p = m.personnel.toString();
            mapMontants.set(p, (mapMontants.get(p) || 0) + m.montant);
          }
        } else {
          console.log("Aucun montantParPn pour facture :", f._id);
        }
      }

      const result = [];

      for (const [personnelId, montant] of mapMontants.entries()) {
        const created = await prelevement.create({
          personnel: personnelId,
          montantTotal: montant,
          dateDebut: debut,
          dateFin: fin,
        });

        console.log("Prélevement créé :", created);
        result.push(created);
      }
      const fct = factures.map((f) => f._id);
      if (fct.length > 0) {
        await facture.updateMany(
          { _id: { $in: fct } },
          { $set: { Preleve: true } }
        );
      }
      console.log("Prélevements générés :", result.length);
      return result;
    } catch (err) {
      console.error("Erreur lors de la création du prélèvement :", err);
      throw err;
    }
  }

  static async tousPrelevement() {
    try {
      const prelevements = await prelevement.find().populate("personnel");
      console.log("Prélevements récupérés :", prelevements.length);
      return prelevements;
    } catch (err) {
      console.error("Erreur dans tousPrelevement :", err);
      throw err;
    }
  }
  static async AnnulerPrelevement(id) {
    try {
      const preleve = await prelevement.findById(id);
      if (!preleve) {
        throw new Error("Aucun prelevement trouvé ! ");
      }
      preleve.annulation = true;
      await preleve.save();
    } catch (err) {
      throw err;
    }
  }
  static async MesPrelevement(Matricule) {
    try {
      const pv = await prelevement.find({ personnel: Matricule });
      return pv;
    } catch (err) {
      throw err;
    }
  }
  static async DetailPrelevement(prelevementId) {
    try {
      const preleve = await prelevement.findById(prelevementId);
      if (!preleve) {
        throw new Error("Prélevement introuvable.");
      }
      const { personnel, dateDebut, dateFin } = preleve;
      const factures = await facture.find({
        DateFacture: { $gte: dateDebut, $lte: dateFin },
        Statut: "confirmé",
        Preleve: true,
        "montantParPn.personnel": personnel,
      });
      const details = {};
      for (const f of factures) {
        const vol = f.NumVol || f.vol || "Vol inconnu"; 
        const montantPourPn = f.montantParPn.find(
          (m) => m.personnel.toString() === personnel
        );
        if (montantPourPn) {
          if (!details[vol]) {
            details[vol] = 0;
          }
          details[vol] += montantPourPn.montant;
        }
      }

      return {
        personnel,
        dateDebut,
        dateFin,
        detailsParVol: details,
      };
    } catch (err) {
      console.error("Erreur dans DetailPrelevement :", err);
      throw err;
    }
  }
}

module.exports = PrelevementController;
