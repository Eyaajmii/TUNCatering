const CarnetSante=require("../models/Carnetsante")
class CarnetSanteControlelr {
  static async creerCarnet(Matricule,Allergies=null,Maladie=null,Medicaments=null,Commentaires=null){
    try{
      const foundCarnet = await CarnetSante.findOne({ Matricule });
      if(foundCarnet){
        throw new Error("Un carnet de santé existe déjà !");
      }
      const newCarnet = await CarnetSante.create({
        Matricule,
        Allergies,
        Maladie,
        Medicaments,
        Commentaires,
      });
      console.log("Carnet de santé ajouté avec succès.");
      return newCarnet;
    }catch(err){
      throw err;
    }
  }
  static async getCarnet(Matricule){
    try{
      const foundCarnet = await CarnetSante.findOne({ Matricule: Matricule });
      return foundCarnet;
    }catch(err){
      console.log(err);
    }
  }
  static async modifCarnet(Matricule,data){
    try{
      return await CarnetSante.findOneAndUpdate({Matricule}, data, {
        new: true,
      });
    }catch(err){
      throw err;
    }
  }
  static async supprimerCarnet(Matricule){
    try{
      const carnet = await CarnetSante.findOne({Matricule:Matricule});
      if(!carnet){
        throw new Error("Aucun carnet trouvé ! ");
      }
      await CarnetSante.findOneAndDelete({Matricule:Matricule});
      return { message: "Carnet supprimé avec succès." };
    }catch(err){
      throw err;
    }
  }
}
module.exports = CarnetSanteControlelr;