const commande = require("../models/Commande");
const Menu = require("../models/Menu");
const plat = require("../models/Meal");
const menucontroller = require("./menuController");
const platcontroller = require("./mealController");
const flight = require("../models/vol");

class CommandeController {
  // Return all orders
  static async getAllCommands() {
    try {
      const commandes = await commande.find();
      console.log("Commandes récupérées:", commandes);
      return commandes;
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes:", error);
      throw new Error("Error retrieving commands: " + error.message);
    }
  }
  static async getMyOrders(MatriculePn) {
    try {
      const Myorders = await commande.find({ MatriculePn: MatriculePn });
      console.log("Commandes récupérées:", Myorders);
      return Myorders;
    } catch (err) {
      console.error("Erreur lors de la récupération des commandes:", err);
    }
  }
  // Return total number of orders
  static async getTotalCommand() {
    try {
      return await commande.countDocuments();
    } catch (error) {
      throw new Error("Error retrieving command count: " + error.message);
    }
  }

  // Return order by ID
  static async getCommandByID(id) {
    try {
      const cmd = await commande
        .findById(id)
        .populate("MatriculePn", "Matricule dateVolDep numVol")
        .populate("nomMenu", "nom");
      if (!cmd) {
        throw new Error("Commande not found");
      }
      return cmd;
    } catch (error) {
      throw new Error("Error retrieving command: " + error.message);
    }
  }
  //Orders for tunisair direction
  static async RequestCommande(numVol, nom, MatriculeDirTunCater, nbrCmd) {
    try {
      if (typeof numVol !== "number") {
        throw new Error("numVol must be a number");
      }

      const vol = await flight.findOne({ numVol: numVol });
      if (!vol) {
        throw new Error("Flight not found");
      }

      const volId = vol._id;
      const dureeVol = parseInt(vol.DureeVol);
      const cmdExist = await commande.countDocuments({
        vol: volId,
        MatriculeDirTunCater,
      });
      if (dureeVol > 6 && cmdExist>=2) {
        throw new Error("Only 2 menu are allowed per PN for flights > 6h");
      }
      if (dureeVol <= 6 && cmdExist>=1) {
        throw new Error("Only 1 menu is allowed per PN for flights ≤ 6h");
      }

      const menu = await Menu.findOne({ nom: nom });
      if (!menu || !menu.Disponible) {
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

      const newCmd = await commande.create({
        vol: volId,
        menu: menuId,
        dateCommnade: date,
        Statut: "En attente",
        NombreCommande: nbrCmd,
        MatriculeDirTunCater: MatriculeDirTunCater,
      });
      await menucontroller.miseajourmenuCommande(nom);
      return newCmd;
    } catch (err) {
      console.error("Erreur lors de la récupération des commandes:", err);
      throw err;
    }
  }

  // Order Menu
  static async RequestCommandeMenu(numVol, nom, MatriculePn) {
    try {
      if (typeof numVol !== "number") {
        throw new Error("numVol must be a number");
      }

      const vol = await flight.findOne({ numVol: numVol });
      if (!vol) {
        throw new Error("Flight not found");
      }

      const volId = vol._id;
      const dureeVol = parseInt(vol.DureeVol);
      const cmdExist = await commande.countDocuments({
        vol: volId,
        MatriculePn,
      });

      // Validate meal limits based on flight duration
      if (dureeVol > 6 && cmdExist >= 2) {
        throw new Error("Only 2 meals are allowed per PN for flights > 6h");
      }
      if (dureeVol <= 6 && cmdExist >= 1) {
        throw new Error("Only 1 meal is allowed per PN for flights ≤ 6h");
      }

      const menu = await Menu.findOne({ nom: nom });
      if (!menu || !menu.Disponible) {
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

      const newCmd = await commande.create({
        vol: volId,
        menu: menuId,
        dateCommnade: date,
        Statut: "En attente",
        NombreCommande: cmdExist + 1,
        MatriculePn: MatriculePn || undefined,
      });

      await menucontroller.miseajourmenuCommande(nom);
      return newCmd;
    } catch (err) {
      throw new Error("Error creating command: " + err.message);
    }
  }

  // Order three meals
  static async RequestCommandeMeal(
    numVol,
    nomEntree,
    nomPlatPrincipal,
    nomDessert,
    nomBoissons,
    nomPetitDejuner,
    MatriculePn
  ) {
    try {
      if (typeof numVol !== "number") {
        throw new Error("numVol must be a number");
      }

      const vol = await flight.findOne({ numVol: numVol });
      if (!vol) {
        throw new Error("Flight not found");
      }

      const volId = vol._id;
      const dureeVol = parseInt(vol.DureeVol);
      const cmdExist = await commande.countDocuments({
        vol: volId,
        MatriculePn,
      });

      // Validate meal limits based on flight duration
      if (dureeVol > 6 && cmdExist >= 2) {
        throw new Error("Only 2 meals are allowed per PN for flights > 6h");
      }
      if (dureeVol <= 6 && cmdExist >= 1) {
        throw new Error("Only 1 meal is allowed per PN for flights ≤ 6h");
      }
      if (cmdExist > 0) {
        throw new Error("PN already has a meal on this flight");
      }

      const Entree = await plat.findOne({ nom: nomEntree, typePlat: "Entrée" });
      const PlatPrincipal = await plat.findOne({
        nom: nomPlatPrincipal,
        typePlat: "Plat Principal",
      });
      const Dessert = await plat.findOne({
        nom: nomDessert,
        typePlat: "Dessert",
      });
      const Boissons = await plat.findOne({
        nom: nomBoissons,
        typePlat: "Boissons",
      });
      const PetitDejuner = await plat.findOne({
        nom: nomPetitDejuner,
        typePlat: "Petit déjeuner",
      });

      if (!Entree || !PlatPrincipal || !Dessert) {
        throw new Error("Plat not found");
      }
      if (
        !Entree.Disponibilite ||
        !PlatPrincipal.Disponibilite ||
        !Dessert.Disponibilite
      ) {
        throw new Error("Plat indisponible");
      }

      const categorie = Entree.Categorie;
      if (
        PlatPrincipal.Categorie !== categorie ||
        Dessert.Categorie !== categorie ||
        (Boissons && Boissons.Categorie !== categorie) ||
        (PetitDejuner && PetitDejuner.Categorie !== categorie)
      ) {
        throw new Error(
          "Tous les plats doivent appartenir à la même catégorie."
        );
      }

      const date = new Date();
      const limitdate = new Date(vol.dateVolDep);
      const deadline = new Date(limitdate);
      if (["Tunis", "Monastir", "Djerba"].includes(vol.Destination)) {
        deadline.setHours(deadline.getHours() - 3);
      } else if (
        ["Enfidha", "Sfax", "Tozeur", "Tabarka"].includes(vol.Destination)
      ) {
        deadline.setHours(deadline.getHours() - 12);
      }

      if (date > limitdate) {
        throw new Error("Commande not allowed after the flight departure time");
      }

      const newCmd = await commande.create({
        vol: volId,
        plats: [
          Entree._id,
          PlatPrincipal._id,
          Dessert._id,
          Boissons ? Boissons._id : null,
          PetitDejuner ? PetitDejuner._id : null,
        ],
        dateCommnade: date,
        Statut: "En attente",
        NombreCommande: cmdExist + 1,
        MatriculePn: MatriculePn || undefined,
      });

      await platcontroller.miseajourquantite(
        Entree,
        PlatPrincipal,
        Dessert,
        Boissons,
        PetitDejuner
      );
      console.log("Commande bien affectée");
      return newCmd;
    } catch (err) {
      throw new Error("Error creating meal order: " + err.message);
    }
  }
  static async updateCommandeStatus(id, newStatus) {
    try {
      const updatedCommande = await commande.findByIdAndUpdate(
        id,
        { Statut: newStatus }, // Notez la majuscule 'Statut' pour correspondre au schéma
        { new: true, runValidators: true }
      );

      if (!updatedCommande) {
        throw new Error("Commande not found");
      }

      return updatedCommande;
    } catch (error) {
      throw error;
    }
  }

  // Cancel an order
  static async cancelCommandeRequest(id) {
    try {
      const cancelCommande = await commande.findById(id);
      if (!cancelCommande) {
        throw new Error("Command request not found");
      }
      if (cancelCommande.Statut !== "En attente") {
        throw new Error(
          "Command request cannot be canceled, it has already been processed"
        );
      }
      await commande.findByIdAndDelete(id);
      return { message: "Command request canceled successfully" };
    } catch (error) {
      throw new Error("Error canceling command request: " + error.message);
    }
  }
}

module.exports = CommandeController;
