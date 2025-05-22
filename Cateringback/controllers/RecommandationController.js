const Menu = require("../models/Menu");
const Plat = require("../models/Plat");
const carnet = require("../models/Carnetsante");
const commande = require("../models/Commande");
class RecommandationController {
  //peremt au chat de prendre les plats et les menus a partir des commandes existant dans la base=Historique
  static async HistoriqueCommandes(MatriculePn) {
    try {
      const cmds = await commande
        .find({ MatriculePn: MatriculePn })
        .populate("plats")
        .populate({
          path: "menu",
          populate: [
            { path: "PlatsEntree" },
            { path: "PlatsPrincipaux" },
            { path: "PlatsDessert" },
            { path: "Boissons" },
          ],
        });
      if (cmds.length === 0) return null;
      const Tabplats = {};
      //extarire le nombre des plats et leur nom
      for (const c of cmds) {
        if (c.plats && c.plats.length > 0) {
          for (const p of c.plats) {
            Tabplats[p._id] = Tabplats[p._id] || { count: 0, p };
            Tabplats[p._id].count += 1;
          }
        }
        if (c.menu && c.menu.plats && c.menu.plats.length > 0) {
          const menuPlats = [
            ...(c.menu.PlatsEntree || []),
            ...(c.menu.PlatsPrincipaux || []),
            ...(c.menu.PlatsDessert || []),
            ...(c.menu.Boissons || []),
          ];
          for (const p of menuPlats) {
            Tabplats[p._id] = Tabplats[p._id] || { count: 0, p };
            Tabplats[p._id].count += 1;
          }
        }
      }
      //trie des plats a partir le plus commandé au moin commané
      const sortedPlats = Object.values(Tabplats)
        .sort((a, b) => b.count - a.count)
        .map((item) => item.plat);

      // Retourner les 4 plats le plus commandé
      return sortedPlats.slice(0, 4);
    } catch (err) {
      throw err;
    }
  }
  //return menu of the day
  static async getMenuJour() {
    try {
      const date = new Date().setHours(0, 0, 0, 0);
      const menu = await Menu.findOne({
        DateAjout: { $gte: date },
        Disponible: true,
      }).populate("PlatsEntree PlatsPrincipaux PlatsDessert Boissons");
      if (!menu) {
        console.log("Aucun menu trouvé");
      }
      const description = [
        `Entrée : ${menu.PlatsEntree[0]?.nom}`,
        `Plat principal : ${menu.PlatsPrincipaux[0]?.nom}`,
        `Dessert : ${menu.PlatsDessert[0]?.nom}`,
        `Boisson : ${menu.Boissons[0]?.nom}`,
      ].join(", ");
      return {
        nom: menu.nom,
        ...menu._doc,
        description,
      };
    } catch (err) {
      console.log(err);
    }
  }
  static async recommandationGenerale() {
    const menu = Math.random() < 0.5; //50% pour choisir menu
    //const typePlat=["Entrée", "Plat Principal", "Dessert","Boisson","Petit déjuner"];
    const typePlat = ["Entrée", "Plat Principal", "Dessert", "Boisson"];
    if (menu) {
      const menuDispo = await Menu.find({ Disponible: true }).populate(
        "PlatsEntree PlatsPrincipaux PlatsDessert Boissons"
      );
      if (menuDispo.length === 0) {
        return null;
      }
      const menuAlea = menuDispo[Math.floor(Math.random() * menuDispo.length)];
      return {
        type: "menu",
        data: {
          ...menuAlea._doc,
          description: [
            `Entrée : ${menuAlea.PlatsEntree[0]?.nom}`,
            `Plat principal : ${menuAlea.PlatsPrincipaux[0]?.nom}`,
            `Dessert : ${menuAlea.PlatsDessert[0]?.nom}`,
            `Boisson : ${menuAlea.Boissons[0]?.nom}`,
          ].join(", "),
        },
      };
    } else {
      const platsParType = {};
      for (const type of typePlat) {
        const plats = await Plat.find({ typePlat: type, Disponibilite: true });
        if (plats.length > 0) {
          platsParType[type] = plats[Math.floor(Math.random() * plats.length)];
        }
      }
      return { type: "plats", data: platsParType };
    }
  }
  static async HistoriqueEtCarnet(MatriculePn) {
    try {
      const carnet = await carnet.findOne({ MatriculePn: MatriculePn });
      if (!carnet) {
        console.log("Aucun carnet trouvé");
        return null;
      }
      const plats = await Meal.find({ Disponibilite: true });
      const recommandations = plats.filter((plat) => {
        const Maladie = carnet.Maladie || [];
        const Allergies = carnet.Allergies || [];
        return (
          !Maladie.some((Maladie) => plat.Categorie.includes(Maladie)) &&
          !Allergies.some((Allergies) => plat.Categorie.includes(Allergies)) &&
          !platsCommandes.some(
            (commandePlat) =>
              commandePlat._id.toString() === plat._id.toString()
          )
        ); //pour excluir les plats deja dans l'historique
      });
      return recommandations;
    } catch (err) {
      console.log(err);
    }
  }
  /*static async MenuPlusCommande(){
    try{

    }catch(err){
      throw err;
    }
  }*/
}
module.exports = RecommandationController;
