const plat=require("../models/Meal");

class mealController {
  static async createMeal(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "pas d'image." });
      }
      const { nom, description, typePlat, prix, Disponibilite, Categorie } =
        req.body;
      if (
        !nom ||
        !description ||
        !typePlat ||
        !prix ||
        !Categorie ||
        !Disponibilite == undefined
      ) {
        return res(400).json({ message: "Les champs sont obligés." });
      }
      const newmeal = await plat.create({
        nom,
        description,
        typePlat,
        prix,
        Disponibilite,
        Categorie,
        //adminTn,
        image: req.file.filename,
      });
      res.status(200).json(newmeal);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }

  static async getAllMeals() {
    try {
      return await plat.find();
    } catch (error) {
      console.log(error);
    }
  }
  static async getMealByType(typePlat) {
    try {
      const mealsbytype = await plat.find({ typePlat, Disponibilite: true });
      console.log("Plats trouves :", mealsbytype);
      return mealsbytype;
    } catch (error) {
      console.log(error);
    }
  }
  static async getMealById(id) {
    try {
      return await plat.findById(id);
    } catch (error) {
      console.log(error);
    }
  }
  static async cancelMeal(id) {
    try {
      return await plat.findByIdAndDelete(id);
    } catch (error) {
      console.log(error);
    }
  }
  static async updateMeal(id, data) {
    try {
      return await plat.findByIdAndUpdate(id, data, { new: true });
    } catch (err) {
      console.log(err);
    }
  }
}
module.exports = mealController;