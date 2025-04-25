const plat=require("../models/Meal");

class mealController {
  //create meal
  static async createMeal(req, res) {
    try {
      //exitance image
      if (!req.file) {
        return res.status(400).json({ message: "pas d'image." });
      }
      const {
        nom,
        description,
        typePlat,
        prix,
        Disponibilite,
        Categorie,
        quantite,
      } = req.body;
      if (
        !nom ||
        !description ||
        !typePlat ||
        !prix ||
        !Categorie ||
        !quantite ||
        !Disponibilite == undefined
      ) {
        return res.status(400).json({ message: "Les champs sont obligés." });
      }
      //existance
      const existe = await plat.findOne({ nom });
      if (existe) {
        return res.status(400).json({ message: "ce plat existe deja." });
      }
      const newmeal = await plat.create({
        nom,
        description,
        typePlat,
        prix,
        Disponibilite,
        Categorie,
        quantite,
        //adminTn,
        personnelTunisieCatering: req.user.username,
        image: req.file.filename,
      });
      res.status(200).json(newmeal);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }
  //return all meals
  static async getAllMeals() {
    try {
      return await plat.find();
    } catch (error) {
      console.log(error);
    }
  }
  //return meal by type
  static async getMealByType(typePlat) {
    try {
      const mealsbytype = await plat.find({ typePlat, Disponibilite: true });
      console.log("Plats trouves :", mealsbytype);
      return mealsbytype;
    } catch (error) {
      console.log(error);
    }
  }
  //return meal by id
  static async getMealById(id) {
    try {
      return await plat.findById(id);
    } catch (error) {
      console.log(error);
    }
  }
  //Admin cancel a meal
  static async cancelMeal(id) {
    try {
      return await plat.findByIdAndDelete(id);
    } catch (error) {
      console.log(error);
    }
  }
  //Admin update meal
  static async updateMeal(id, data) {
    try {
      return await plat.findByIdAndUpdate(id, data, { new: true });
    } catch (err) {
      console.log(err);
    }
  }
  //Admin set quantity of meal
  static async miseajourquantite(Entree, PlatPrincipal, Dessert, Boisson) {
    try {
      const plats = [Entree, PlatPrincipal, Dessert, Boisson];
      for (let p of plats) {
        if (!p) {
          continue;
        }
        if (p.quantite > 0) {
          p.quantite -= 1;
        }
        if (p.quantite === 0) {
          p.Disponibilite = false;
        }
        await p.save();
      }
    } catch (err) {
      console.log(err);
    }
  }
  static async  miseajourqtePetitdejuner(Petitdejuner = []) {
    try {
      for (let plat of Petitdejuner) {
        if (!plat) continue;

        if (plat.quantite > 0) {
          plat.quantite -= 1;
        }

        if (plat.quantite === 0) {
          plat.Disponibilite = false;
        }
        await plat.save();
      }
    } catch (err) {
      console.error(
        "Erreur lors de la mise à jour du petit déjeuner :",
        err.message
      );
    }
  }
}
module.exports = mealController;