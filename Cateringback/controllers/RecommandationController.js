const Menu = require("../models/Menu"); 
const Meal = require("../models/Meal"); 
const carnet = require("../models/Carnetsante");
const commande=require("../models/Commande");
class RecommandationController {
  //return menu of the day
  static async getMenuJour() {
    try {
      const date = new Date().toISOString().split("T")[0]; //Le caractère "T" est utilisé comme délimiteur.(Javascript.info)
      const menu = await Menu.findOne({ DateAjout: date })
        .populate("PlatsEntree", "nom description")
        .populate("PlatsPrincipaux", "nom description")
        .populate("PlatsDessert", "nom description");
      if (!menu) {
        console.log("Aucun menu trouvé");
      }
      return menu;
    } catch (err) {
      console.log(err);
    }
  }
  //get recommandation from health record and historique of orders
  static async HistoriqueEtCarnet(MatriculePn) {
    try {
        if(!MatriculePn){
            console.log("MatriculePn pas trouvé!!!");
            return null;
        }
        const cmds = await commande.find({ MatriculePn: MatriculePn }).populate("plats");
        const platsCommandes=cmds.flatMap(commande=>commande.plats);
        const carnet = await carnet.findOne({ MatriculePn: MatriculePn});
        if (!carnet) {
            console.log("Aucun carnet trouvé");
            return null;
        }
        const plats=await Meal.find({Disponibilite:true});
        const recommandations = plats.filter(plat=>{
            const Maladie=carnet.Maladie||[];
            const Allergies = carnet.Allergies || [];
            return !Maladie.some(Maladie=>plat.Categorie.includes(Maladie))
            && !Allergies.some(Allergies=>plat.Categorie.includes(Allergies))&&
             !platsCommandes.some(commandePlat => commandePlat._id.toString() === plat._id.toString());//pour excluir les plats deja dans l'historique
        });
        return recommandations;
    } catch (err) {
      console.log(err);
    }
  }
}
module.exports = RecommandationController;