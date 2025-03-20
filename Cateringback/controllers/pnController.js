const pn=require("../models/personnelnavigant");

class PnController {
  static async addPn(
    email,
    password,
    username,
    nom,
    prenom,
    telephone,
    Matricule,
    TypePersonnel
  ) {
    try {
      // Vérification des champs obligatoires
      if (!Matricule || !password || !username) {
        console.log("Matricule, username et password sont obligatoires.");
        
      }

      // Vérification si le matricule existe déjà
      const existingPn = await pn.findOne({ Matricule });
      if (existingPn) {
        console.log("Ce matricule est déjà utilisé.");
      }

      // Création d'un nouvel utilisateur PN
      const newPn = new pn({
        email,
        password,
        username,
        nom,
        prenom,
        telephone,
        Matricule,
        TypePersonnel,
      });
      await newPn.save();
      console.log("Personnel navigant ajouté avec succès.");
      return newPn;
    } catch (error) {
      console.log(error)
    }
  }
}
module.exports = PnController;