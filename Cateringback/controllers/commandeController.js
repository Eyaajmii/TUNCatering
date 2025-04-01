const commande=require("../models/Commande");
const personnel=require("../models/personnelnavigant");
const Menu=require("../models/Menu");
const plat=require("../models/Meal");
const menucontroller=require('./menuController');
const platcontroller=require("./mealController");
const flight=require("../models/vol");


class CommandeController {
  //return all orders
  static async getAllCommands() {
    try {
      if (commande.MatriculePn) {
        return await commande
          .find()
          .populate("MatriculePn", "Matricule dateVolDep numVol")
          .populate("nomMenu", "nom");
      }
      return commande
        .find()
        .populate("MatriculeResTun", "Matricule")
        .populate("nomMenu", "nom").populate;
    } catch (error) {
      throw new Error("error retreiveing commands:" + error);
    }
  }
  //return total of orders
  static async getTotatCommand() {
    try {
      return await commande.countDocuments();
    } catch (error) {
      throw new Error("error retreiveing commands:" + error);
    }
  }
  //return order by id
  static async getCommandByID(id) {
    try {
      const cmd = await commande
        .findById(id)
        .populate("MatriculePn", "Matricule dateVolDep  numVol")
        .populate("nomMenu", "nom");
      if (!cmd) {
        throw new Error("commande not found");
      }
    } catch (error) {
      throw new Error("error retreiveing commands:" + error);
    }
  }
  //OrderMenu
  static async RequestCommandeMenu(numVol,nom,MatriculePn=null,MatriculeResTun=null,nombrecmd=null) {
    try {
      if (typeof numVol !== "number") {
        throw new Error("numVol doit être un nombre");
      }
      const vol = await flight.findOne({ numVol: numVol });
      if (!vol) {
        console.log("vol not found");
      }
      const volId=vol._id;
      const dureeVol = parseInt(vol.DureeVol);
      const menu = await Menu.findOne({ nom: nom });
      if (!menu.Disponible) {
        throw new Error("Menu not available");
      }
      const menuId = menu._id;
      const date = new Date();
      const limitdate = new Date(vol.dateVolDep);
      if (date > limitdate) {
        throw new Error("Commande not allowed after the flight departure time");
      }
      const deadline = new Date(limitdate);
      if (["Tunis", "Monastir", "Djerba"].includes(vol.Depart)) {
        deadline.setHours(deadline.getHours() - 3);
      } else if (
        ["Enfidha", "Sfax", "Tozeur", "Tabarka"].includes(vol.Depart)
      ) {
        deadline.setHours(deadline.getHours() - 12);
      }
      //Pour pn
      if(MatriculePn){
      const cmdExist = await commande.countDocuments({vol: volId,MatriculePn,});
      if (dureeVol > 6 && cmdExist >= 2) {
        throw new Error("Only 2 meals are allowed per PN for flights > 6h");
      }
      if (dureeVol <= 6 && cmdExist >= 1) {
        throw new Error("Only 1 meal is allowed per PN for flights ≤ 6h");
      }
      const newCmd = await commande.create({
        vol: volId,
        menu: menuId,
        dateCommnade: date,
        Statut: "En attente",
        NombreCommande: cmdExist + 1,
        MatriculePn: MatriculePn ,
      });
      await menucontroller.miseajourmenuCommande(nom);
      return newCmd;
    }
    //pour le responsable tunisair
    if(MatriculeResTun){
      const cmdExist = await commande.countDocuments({vol: volId,MatriculeResTun,});
      if (dureeVol <= 6 && cmdExist) {
        throw new Error("Max 1 menu autorisé pour ResTun sur vols ≤ 6h");
      }

      if (!menu.Disponible) {
        throw new Error(
          `Menu non disponible, seules ${menu.nombreDisponible} commandes peuvent être passées`
        );
      }
      const newCmd = await commande.create({
        vol: volId,
        menu: menuId,
        dateCommnade: date,
        Statut: "En attente",
        NombreCommande: nombrecmd,
        MatriculeResTun: MatriculeResTun,
      });
      await menucontroller.miseajourmenuCommande(nom);
      return newCmd;
    }
      throw new Error("Aucun matricule valide fourni");
    } catch (err) {
      throw new Error("error creating command:" + err);
    }
  }
  //Order a 3 meals
  /*Later =>Pn can order 1 meal to 3 to 4 his choice !!!!*/
  static async RequestCommandeMeal(numVol,nomEntree,nomPlatPrincipal,nomDessert,nomBoissons,nomPetitDejuner,MatriculePn,MatriculeResTun){
    try{
      if (typeof numVol !== "number") {
        throw new Error("numVol doit être un nombre");
      }
      const vol = await flight.findOne({ numVol: numVol });
      if (!vol) {
        throw new Error("vol not found");
      }
      const volId=vol._id;
      const dureeVol = parseInt(vol.DureeVol);
      const cmdExist = await commande.countDocuments({vol: volId,MatriculePn,});
      if (dureeVol > 6 && cmdExist >= 2) {
        throw new Error("Only 2 meals are allowed per PN for flights > 6h");
      }
      if (dureeVol <= 6 && cmdExist >= 1) {
        throw new Error("Only 1 meal is allowed per PN for flights ≤ 6h");
      }
      if(cmdExist>0){
        throw new Error("PN already has a meal on this flight");
      }
      const Entree= await plat.findOne({nom:nomEntree,typePlat:"Entrée"});
      const PlatPrincipal= await plat.findOne({nom:nomPlatPrincipal,typePlat:"Plat Principal"});
      const Dessert= await plat.findOne({nom:nomDessert,typePlat:"Dessert"});
      const Boissons= await plat.findOne({nom:nomBoissons,typePlat:"Boissons"});
      const PetitDejuner= await plat.findOne({nom:nomPetitDejuner,typePlat:"Petit déjuner"});
      if(!Entree||!PlatPrincipal||!Dessert){
        throw new Error("Plat not found ");
      }
      if(!Entree.Disponibilite||!PlatPrincipal.Disponibilite||!Dessert.Disponibilite||!Boissons.Disponibilite||!PetitDejuner.Disponibilite){
        throw new Error("Plat indisponible");
      }
      const categorie = Entree.Categorie;
      if (
        PlatPrincipal.Categorie !== categorie ||
        Dessert.Categorie !== categorie ||
        Boissons.Categorie !== categorie ||
        PetitDejuner.Categorie !== categorie
      ) {
        throw new Error(
          "Tous les plats doivent appartenir à la même catégorie."
        );
      }
      const date = new Date();
      const limitdate = new Date(vol.dateVolDep);
      const deadline = new Date(limitdate);
      if (["Tunis", "Monastir","Djerba"].includes(vol.Destination)) {
        deadline.setHours(deadline.getHours() - 3);
      } else if (["Enfidha", "Sfax","Tozeur","Tabarka"].includes(vol.Destination)) {
        deadline.setHours(deadline.getHours() - 12);
      }
      if (date > limitdate) {
        throw new Error("Commande not allowed after the flight departure time");
      }
      const newCmd = await commande.create({
        vol: volId,
        plats: [Entree._id,PlatPrincipal._id,Dessert._id,Boissons._id,PetitDejuner._id],
        dateCommnade: date,
        Statut: "En attente",
        NombreCommande: cmdExist + 1,
        MatriculePn: MatriculePn || undefined,
        MatriculeResTun: MatriculeResTun || undefined,
      });
      await platcontroller.miseajourquantite(Entree,PlatPrincipal,Dessert,Boissons,PetitDejuner);
      console.log("Commande bien affecte");
      return newCmd;
    }catch(err){
      throw new Error(err.message);
    }
  }
  //Admin modify state of order
  static async updateCommandeStatus(id, status) {
    try {
      const Updatecommande = await commande.findByIdAndUpdate(id, {
        statut: status,
      });
      if (!Updatecommande) {
        throw new Error("commande request not found");
      }
      return Updatecommande;
    } catch (error) {
      throw new Error("error updating commande status:" + error);
    }
  }
  //Cancel an order
  static async cancelcommandeRequest(id) {
    try {
      const Cancelcommande = await commande.findById(id);
      if (!Cancelcommande) {
        throw new Error("Command request not found");
      }
      if (Cancelcommande.Statut !== "En attente") {
        throw new Error(
          "Command request cannot be canceled, it has already been processed"
        );
      }
      await commande.findByIdAndDelete(id);
      return { message: "Command request canceled successfully" };
    } catch (error) {
      throw new Error("Error canceling Command request: " + error.message);
    }
  }
}

module.exports = CommandeController;