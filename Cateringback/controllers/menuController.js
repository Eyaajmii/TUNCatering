const Menu = require("../models/Menu"); 
const Meal = require("../models/Meal"); 

class menuController {
  static async createMenu(nom, PlatsPrincipaux, PlatsEntree, PlatsDessert) {
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
      const platsPrincipaux = await Meal.find({
        _id: { $in: PlatsPrincipaux },
      });
      const platsEntrees = await Meal.find({ _id: { $in: PlatsEntree } });
      const platsDesserts = await Meal.find({ _id: { $in: PlatsDessert } });

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
}

module.exports = menuController;
