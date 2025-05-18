const Menu = require("../models/Menu"); 
const Meal = require("../models/Meal"); 

class menuController {
  //create a menu
  static async createMenu(nom, PlatsPrincipaux, PlatsEntree, PlatsDessert,Boissons,Disponible,personnelTunisieCatering) {
    try {
      //existance menu
      const exist = await Menu.findOne({ nom: nom });
      if (exist) {
       throw new Error("Menu déja existe");
      }
      // Vérifier qu'il y a un seul plat pour chaque type
      if (
        PlatsPrincipaux.length !== 1 ||
        PlatsEntree.length !== 1 ||
        PlatsDessert.length !== 1||
        Boissons.length!==1
      ) {
        throw new Error(
          "Vous devez choisir un seul plat pour chaque type de plat"
        );
      }

      // les plates dans bd
      const platsPrincipaux = await Meal.find({_id: { $in: PlatsPrincipaux },});
      const platsEntrees = await Meal.find({ _id: { $in: PlatsEntree } });
      const platsDesserts = await Meal.find({ _id: { $in: PlatsDessert } });
      const boissons=await Meal.find({_id: {$in:Boissons}});
      if(platsPrincipaux[0]?.quantite<=0||platsEntrees[0]?.quantite<=0||platsDesserts[0]?.quantite<=0||boissons[0]?.quantite<=0){
        throw new Error("Quantité insuffisante pour les plats choisis");
      }
      const prixTotal =
        (platsPrincipaux[0]?.prix || 0) +
        (platsEntrees[0]?.prix || 0) +
        (platsDesserts[0]?.prix || 0) +
        (boissons[0]?.prix||0);
      
      const nouveauMenu = await Menu.create({
        nom,
        PlatsPrincipaux,
        PlatsEntree,
        PlatsDessert,
        Boissons,
        Disponible: true,
        prixtotal: prixTotal,
        DateAjout: Date.now(),
        personnelTunisieCatering: personnelTunisieCatering,
      }); 
      return nouveauMenu;
    } catch (err) {
      console.error(err);
      throw err; 
    }
  }
  //return detail menu by id
  static async getMenuDetail(id) {
    try {
      const menu= await Menu.findById(id)
        .populate("PlatsEntree", "nom description")
        .populate("PlatsPrincipaux", "nom description")
        .populate("PlatsDessert", "nom description")
        .populate("Boissons","nom description");
      if(!menu){
        throw new Error("Aucun menu trouvé!");
      }
      return menu;
    } catch (err) {
      console.error(err);
    }
  }
  //Admin update menu
  static async updateMenu(id, data) {
    try {
      return Menu.findByIdAndUpdate(id, data, { new: true });
    } catch (err) {
      console.error(err);
    }
  }
  //return all menus
  static async getAllMenu() {
    try {
      return Menu.find()
        .populate("PlatsEntree", "nom description")
        .populate("PlatsPrincipaux", "nom description")
        .populate("PlatsDessert", "nom description")
        .populate("Boissons", "nom description");
    } catch (err) {
      console.error(err);
    }
  }
  //Admin cancel menu
  static async cancelMenu(id) {
    try {
      return Menu.findByIdAndDelete(id);
    } catch (error) {
      console.error(error);
    }
  }
  //mise a jour d'un menu apres commande (quantite plats --)
  static async miseajourmenuCommande(nom){
    try{
      const menu = await Menu.findOne({ nom })
        .populate("PlatsEntree")
        .populate("PlatsPrincipaux")
        .populate("PlatsDessert")
        .populate("Boissons", "nom description")
      if(!menu){
        console.log("Menu pas trouvé");
      }
      let menuDispo=true;
      //concatination tous les plats dans un seul ensemble//
      const plats=[...menu.PlatsEntree,...menu.PlatsPrincipaux,...menu.PlatsDessert,...menu.Boissons];
      for(let p of plats){
        if(p.quantite>0){
          p.quantite-=1;
          await p.save();
        }
        if(p.quantite===0){
          p.Disponibilite = false;
          await p.save();
          menuDispo=false;
        }
      }
      menu.Disponible=menuDispo;
      await menu.save();
    }catch(err){
      console.error(err);
    }
  }
}

module.exports = menuController;
