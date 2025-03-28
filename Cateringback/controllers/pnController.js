const pn=require("../models/personnelnavigant");
const CarnetSante=require("../models/Carnetsante")
class PnController {
  static async addPn(email,password,username,nom,prenom,telephone,Matricule,TypePersonnel) {
    try {
      if (!Matricule || !password || !username) {
        console.log("Matricule, username et password sont obligatoires.");
        
      }

      // Vérification si le matricule existe déjà
      const existingPn = await pn.findOne({ Matricule });
      if (existingPn) {
        console.log("Ce matricule est déjà utilisé.");
      }

      // Création d'un nouvel utilisateur PN
      const newPn = await pn.create({
        email,
        password,
        username,
        nom,
        prenom,
        telephone,
        Matricule,
        TypePersonnel,
      });
      console.log("Personnel navigant ajouté avec succès.");
      return newPn;
    } catch (error) {
      console.log(error)
    }
  }
  static async addCarnet(MatriculePn,Allergies,Maladie,Medicaments,Commentaires){
    try{
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
      console.log(err)
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
module.exports = PnController;