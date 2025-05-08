const reclamation=require("../models/ReclamationModel")
const notification = require("../models/NotificationModel");

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
        Statut: "en attente",
      });
      const notifcreer=await notification.create({
        message: `Nouvelle réclamation créée pour le personnel navigant ${MatriculePn}`,
        user: MatriculePn,
        notificationType: "reclamation",
      });
      global.io.emit("newNotification", {
        _id: notifcreer._id,
        message: notifcreer.message,
        createdAt: notifcreer.createdAt,
        user: notifcreer.user,
        notificationType: notifcreer.notificationType,
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
  static async reponseReclamation(id,newStatut,MessageReponse,MatriculeDirTunCater) {
    try {
      const updatedReclamation = await reclamation.findByIdAndUpdate(
        id,
        { MessageReponse, MatriculeDirTunCater, Statut: newStatut },
        { new: true, runValidators: true }
      );
      const notifcreer = await notification.create({
        message: `Statut de la réclamation mis à jour en ${newStatut}`,
        user: updatedReclamation.MatriculePn,
        notificationType: "reclamation",
      });
        global.io.emit("newNotification", {
          _id: notifcreer._id,
          message: notifcreer.message,
          createdAt: notifcreer.createdAt,
          user: notifcreer.user,
          notificationType: notifcreer.notificationType,
        });
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
  static async AnnuleReclamation(id){
    try {
      const rec = await reclamation.findById(id);
      if(rec.Statut!=="en attente"){
        throw new Error("Il faut annulé la réclamation si statut est en attente")
      }
      rec.Statut = "annulée";
      await rec.save();

      return { message: "Réclamation annulée avec succès", rec };
    } catch (err) {
      throw new Error(err.message);
    }
  }
  static async ModifReclamation(id,data){
    try{
      const rec = await reclamation.findById(id);
      if(rec.Statut!=="en attente"){
        throw new Error("Vous ne pouvez modifier la réclamation que si elle est en attente");
      }
      const updatereclamtion=await reclamation.findByIdAndUpdate(id,data,{new:true});
      return { message: "Réclamation modifiée avec succès", updatereclamtion };
    }catch(err){
      throw err;
    }
  }
}
module.exports = reclamationController;