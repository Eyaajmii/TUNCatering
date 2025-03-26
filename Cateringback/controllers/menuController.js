const Menu = require("../models/Menu"); 
const Meal = require("../models/Meal"); 

class menuController {
  static async createMenu(nom, PlatsPrincipaux, PlatsEntree, PlatsDessert,Disponible) {
    try {
      // Vérifier qu'il y a un seul plat pour chaque type
      if (
        PlatsPrincipaux.length !== 1 ||
        PlatsEntree.length !== 1 ||
        PlatsDessert.length !== 1
      ) {
        throw new Error(
          "Vous devez choisir un seul plat pour chaque type de plat"
        );
      }

      // les plates dans bd
      const platsPrincipaux = await Meal.find({_id: { $in: PlatsPrincipaux },});
      const platsEntrees = await Meal.find({ _id: { $in: PlatsEntree } });
      const platsDesserts = await Meal.find({ _id: { $in: PlatsDessert } });
      if(platsPrincipaux[0]?.quantite<=0||platsEntrees[0]?.quantite<=0||platsDesserts[0]?.quantite<=0){
        throw new Error("Quantité insuffisante pour les plats choisis");
      }
      // verification mm categorie
      const categories = [
        platsPrincipaux[0]?.Categorie,
        platsEntrees[0]?.Categorie,
        platsDesserts[0]?.Categorie,
      ];

      if (new Set(categories).size !== 1) {
        throw new Error("Les plats doivent appartenir à la même catégorie.");
      }

      // Créer le nouveau menu
      const nouveauMenu = new Menu({
        nom,
        PlatsPrincipaux,
        PlatsEntree,
        PlatsDessert,
        Disponible:true,
        DateAjout:Date.now(),
      });

      await nouveauMenu.save(); 
      return nouveauMenu;
    } catch (err) {
      console.error(err);
      throw err; 
    }
  }

  static async getMenuDetail(id) {
    try {
      return Menu.findById(id)
        .populate("PlatsEntree", "nom description")
        .populate("PlatsPrincipaux", "nom description")
        .populate("PlatsDessert", "nom description");
    } catch (err) {
      console.error(err);
    }
  }

  static async updateMenu(id, data) {
    try {
      return Menu.findByIdAndUpdate(id, data, { new: true });
    } catch (err) {
      console.error(err);
    }
  }

  static async getAllMenu() {
    try {
      return Menu.find()
        .populate("PlatsEntree", "nom description")
        .populate("PlatsPrincipaux", "nom description")
        .populate("PlatsDessert", "nom description");
    } catch (err) {
      console.error(err);
    }
  }

  static async getMenuBytype(typeMenu) {
    try {
      return Menu.find({ typeMenu })
        .populate("PlatsEntree", "nom description")
        .populate("PlatsPrincipaux", "nom description")
        .populate("PlatsDessert", "nom description");
    } catch (err) {
      console.error(err);
    }
  }

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
      const menu=await Menu.findOne({nom}).populate("PlatsEntree").populate("PlatsPrincipaux").populate("PlatsDessert");
      if(!menu){
        console.log("Menu pas trouvé");
      }
      let menuDispo=true;
      //concatination tous les plats dans un seul ensemble
      const plats=[...menu.PlatsEntree,...menu.PlatsPrincipaux,...menu.PlatsDessert];
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
