const reclamation=require("../models/ReclamationModel")
class reclamationController {
  //pn
  static async creerReclamation(Objet, MessageEnvoye, MatriculePn) {
    try {
      const newReclamation = await reclamation.create({
        Objet,
        MessageEnvoye,
        MessageReponse:null,
        MatriculePn,
        MatriculeDirTunCater:null,
        dateSoumission: Date.now(),
        Statut: "En attente",
      });
      return newReclamation;
    } catch (err) {
      throw err;
    }
  }
  static async MesReclamations(MatriculePn) {
    try {
      const Mesreclamations = await reclamation.find({
        MatriculePn: MatriculePn,
      });
      return Mesreclamations;
    } catch (err) {
      throw new Error("Error retrieving reclamation : " + err.message);
    }
  }
  /** F consulte detail reclamation == quand reclamation traité donc consult reponse */
  static async detailReclamation(id) {
    try {
      const detailReclamation = await reclamation
        .findById(id)
        .populate("MessageReponse");
      return detailReclamation;
    } catch (err) {
      throw new Error("Error retrieving reclamation detail: " + err.message);
    }
  }
  //tunisair
  static async reponseReclamation(
    id,
    newStatut,
    MessageReponse,
    MatriculeDirTunCater
  ) {
    try {
      const updatedReclamation = await reclamation.findByIdAndUpdate(
        id,
        { MessageReponse, MatriculeDirTunCater, Statut: newStatut },
        { new: true, runValidators: true }
      );
      return updatedReclamation;
    } catch (err) {
      throw err;
    }
  }
  static async TousReclamations() {
    try {
      const reclamations = await reclamation.find();
      return reclamations;
    } catch (err) {
      throw new Error("Error retrieving reclamation count: " + err.message);
    }
  }
}
module.exports = reclamationController;