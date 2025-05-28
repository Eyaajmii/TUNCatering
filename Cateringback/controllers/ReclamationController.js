const reclamation=require("../models/ReclamationModel")
class reclamationController {
  //pn
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
      const rec = await reclamation.findById(id);
      const now = new Date();
      const diffInDays =(now - new Date(rec.dateSoumission)) / (1000 * 60 * 60 * 24);
      if (diffInDays > 5) {
        throw new Error("Impossible de traiter une réclamation après 5 jours de soumission.");
      }
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