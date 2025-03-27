const plat=require("../models/Meal");

class mealController {
  //create meal
  static async createMeal(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "pas d'image." });
      }
      const { nom, description, typePlat, prix, Disponibilite, Categorie ,quantite} =
        req.body;
      if (
        !nom ||
        !description ||
        !typePlat ||
        !prix ||
        !Categorie ||
        !quantite ||
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
        quantite,
        //adminTn,
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
      return await plat.find({Disponibilite:true});
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
  static async miseajourquantite(Entree,PlatPrincipal,Dessert,Boissons,PetitDejuner)
  {
    try{
      const plats=[Entree,PlatPrincipal,Dessert,Boissons,PetitDejuner];
      for(let p of plats){
        if(!p){
          continue;
        }
        if(p.quantite>0){
          p.quantite-=1;
        }
        if(p.quantite===0){
          p.Disponibilite = false;
        }
        await p.save();
      }
    }catch(err){
      console.log(err);
    }
  }
}
module.exports = mealController;