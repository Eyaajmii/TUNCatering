const CarnetSante=require("../models/Carnetsante")
class CarnetSanteControlelr {
  static async creerCarnet(MatriculePn,Allergies,Maladie,Medicaments,Commentaires){
    try{
      const foundCarnet = await CarnetSante.findOne({ MatriculePn });
      if(foundCarnet){
        throw new Error("Un carnet de santé existe déjà !");
      }
      const newCarnet = await CarnetSante.create({
        MatriculePn,
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
  static async getCarnet(){
    try{
      return await CarnetSante.find();
    }catch(err){
      console.log(err);
    }
  }
  static async modifCarnet(id,data){
    try{
      return await CarnetSante.findByIdAndUpdate(id, data);
    }catch(err){
      console.log(err);
    }
  }
}
module.exports = CarnetSanteControlelr;