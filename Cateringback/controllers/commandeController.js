const commande = require("../models/Commande");
const Menu = require("../models/Menu");
const plat = require("../models/Meal");
const menucontroller = require("./menuController");
const platcontroller = require("./mealController");
const flight = require("../models/vol");
const notification = require("../models/NotificationModel");

class CommandeController {
  // Return all orders
  static async getAllCommands() {
    try {
      const commandes = await commande
        .find()
        .populate("MatriculePn", "Matricule nom")
        .populate("MatriculeDirTunCater", "Matricule nom")
        .populate("menu", "nom")
        .populate("plats")
        .populate("vol", "numVol");
      console.log("Commandes récupérées:", commandes);
      return commandes;
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes:", error);
      throw new Error("Error retrieving commands: " + error.message);
    }
  }
  //return orders by numvol
  static async getCommandesByNumVol(numVol) {
    try {
      const vol = await flight.findOne({ numVol });

      if (!vol) {
        throw new Error(`Aucun vol trouvé avec le numéro ${numVol}`);
      }
      const commandes = await commande
        .find({ vol: vol._id })
        .populate({ path: "menu", select: "nom" })
        .populate({ path: "plats", select: "nom" })
        .populate({ path: "MatriculePn", select: "nom prenom Matricule" });

      if (commandes.length === 0) {
        throw new Error(`Aucune commande trouvée pour le vol ${numVol}`);
      }
      return commandes;
    } catch (error) {
      throw new Error(
        "Erreur lors de la récupération des commandes: " + error.message
      );
    }
  }

  //return personnelOrder by they matricule
  static async getMyOrders(MatriculePn) {
    try {
      const Myorders = await commande.find({ MatriculePn: MatriculePn }).populate('vol').populate('menu').populate('plats');
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
      if (dureeVol > 6 && cmdExist >= 2) {
        throw new Error("Only 2 menu are allowed per PN for flights > 6h");
      }
      if (dureeVol <= 6 && cmdExist >= 1) {
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
      const total = menu.prixtotal * nbrCmd;
      const newCmd = await commande.create({
        vol: volId,
        menu: menuId,
        dateCommnade: date,
        Statut: "En attente",
        NombreCommande: nbrCmd,
        montantsTotal: total,
        MatriculeDirTunCater: MatriculeDirTunCater,
      });
      await menucontroller.miseajourmenuCommande(nom);
      const notifcreer = await notification.create({
        message: `Nouvelle commande créée pour le vol ${numVol}`,
        user: MatriculeDirTunCater,
        notificationType: "commande",
      });
      global.io.emit("newNotification", {
        _id: notifcreer._id,
        message: notifcreer.message,
        createdAt: notifcreer.createdAt,
        user: notifcreer.user,
        notificationType: notifcreer.notificationType,
      });
      return newCmd;
    } catch (err) {
      console.error("Erreur lors de la récupération des commandes:", err);
      throw err;
    }
  }

  // Order Menu
  static async RequestCommandeMenu(numVol, nom, MatriculePn) {
    try {
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
        throw new Error("Un seul repas est autorisé pour les vols de ≤6h.");
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
      const total = menu.prixtotal;
      const newCmd = await commande.create({
        vol: volId,
        menu: menuId,
        dateCommnade: date,
        Statut: "En attente",
        NombreCommande: cmdExist + 1,
        montantsTotal: total,
        MatriculePn: MatriculePn || undefined,
      });
      await menucontroller.miseajourmenuCommande(nom);
      const notifcreer = await notification.create({
        message: `Nouvelle commande créée pour le vol ${numVol}`,
        user: MatriculePn,
        notificationType: "commande",
      });
      global.io.emit("newNotification", {
        _id: notifcreer._id,
        message: notifcreer.message,
        createdAt: notifcreer.createdAt,
        user: notifcreer.user,
        notificationType: notifcreer.notificationType,
      });
      return newCmd;
    } catch (err) {
      throw new Error("Error creating command: " + err.message);
    }
  }

  // Order three meals
  static async RequestCommandeMeal(
    numVol,
    nomEntree = null,
    nomPlatPrincipal = null,
    nomDessert = null,
    nomBoissons = null,
    nomsPetitdejuner = null,
    MatriculePn
  ) {
    try {
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

      let Entree = null;
      if (nomEntree) {
        Entree = await plat.findOne({
          nom: nomEntree,
          typePlat: "Entrée",
        });
      }

      let PlatPrincipal = null;
      if (nomPlatPrincipal) {
        PlatPrincipal = await plat.findOne({
          nom: nomPlatPrincipal,
          typePlat: "Plat Principal",
        });
      }

      let Dessert = null;
      if (nomDessert) {
        Dessert = await plat.findOne({
          nom: nomDessert,
          typePlat: "Dessert",
        });
      }

      let Boissons = null;
      if (nomBoissons) {
        Boissons = await plat.findOne({
          nom: nomBoissons,
          typePlat: "Boisson",
        });
      }

      let Petitdejeuner = [];
      if (nomsPetitdejuner && Array.isArray(nomsPetitdejuner)) {
        Petitdejeuner = await plat.find({
          nom: nomsPetitdejuner,
          typePlat: "Petit déjuner",
        });

        console.log("Plats de petit déjeuner trouvés :", Petitdejeuner);

        for (const plat of Petitdejeuner) {
          if (!plat.Disponibilite) {
            throw new Error(`Le plat ${plat.nom} n'est pas disponible.`);
          }
        }
      }

      if (
        (Entree && !Entree.Disponibilite) ||
        (PlatPrincipal && !PlatPrincipal.Disponibilite) ||
        (Dessert && !Dessert.Disponibilite) ||
        (Boissons && !Boissons.Disponibilite)
      ) {
        throw new Error("One or more plats are unavailable");
      }

      const categorie = Entree ? Entree.Categorie : null;
      if (
        (PlatPrincipal && PlatPrincipal.Categorie !== categorie) ||
        (Dessert && Dessert.Categorie !== categorie) ||
        (Boissons && Boissons.Categorie !== categorie)
      ) {
        throw new Error("All plats must belong to the same category");
      }

      const date = new Date();
      const limitdate = new Date(vol.dateVolDep);
      const deadline = new Date(limitdate);

      // Adjust deadline based on destination
      if (["Tunis", "Monastir", "Djerba"].includes(vol.Destination)) {
        deadline.setHours(deadline.getHours() - 3);
      } else if (
        ["Enfidha", "Sfax", "Tozeur", "Tabarka"].includes(vol.Destination)
      ) {
        deadline.setHours(deadline.getHours() - 12);
      }

      if (date > limitdate) {
        throw new Error("Order not allowed after the flight departure time");
      }

      let total = 0;
      let platsArray = [];

      if (Petitdejeuner.length > 0) {
        total = Petitdejeuner.reduce((sum, plat) => sum + plat.prix, 0);
        platsArray = Petitdejeuner.map((plat) => plat._id);
      } else {
        total =
          (Entree ? Entree.prix : 0) +
          (PlatPrincipal ? PlatPrincipal.prix : 0) +
          (Dessert ? Dessert.prix : 0) +
          (Boissons ? Boissons.prix : 0);
        platsArray = [
          ...(Entree ? [Entree._id] : []),
          ...(PlatPrincipal ? [PlatPrincipal._id] : []),
          ...(Dessert ? [Dessert._id] : []),
          ...(Boissons ? [Boissons._id] : []),
        ];
      }

      const newCmd = await commande.create({
        vol: volId,
        plats: platsArray,
        dateCommande: date,
        Statut: "En attente",
        NombreCommande: cmdExist + 1,
        montantsTotal: total,
        MatriculePn: MatriculePn || undefined,
      });
      if (Boissons) {
        await platcontroller.miseajourquantite(
          Entree,
          PlatPrincipal,
          Dessert,
          Boissons
        );
      }else if(Petitdejeuner.length>0){
        await platcontroller.miseajourqtePetitdejuner(Petitdejeuner);
      } else {
        await platcontroller.miseajourquantite(Entree, PlatPrincipal, Dessert);
      }

      // Send notification
      const notifcreer = await notification.create({
        message: `Nouvelle commande créée pour le vol ${numVol}`,
        user: MatriculePn,
        notificationType: "commande",
      });

      global.io.emit("newNotification", {
        _id: notifcreer._id,
        message: notifcreer.message,
        createdAt: notifcreer.createdAt,
        user: notifcreer.user,
        notificationType: notifcreer.notificationType,
      });

      console.log("Commande bien enregistrée");
      return newCmd;
    } catch (err) {
      console.error("Error creating meal order:", err.message);
      throw new Error("Error creating meal order: " + err.message);
    }
  }

  static async updateCommandeStatus(id, newStatus) {
    try {
      const updatedCommande = await commande.findByIdAndUpdate(
        id,
        { Statut: newStatus },
        { new: true, runValidators: true }
      );

      if (!updatedCommande) {
        throw new Error("Commande not found");
      }
      const notifcreer = await notification.create({
        message: `Statut de la commande mis à jour en ${newStatus}`,
        user:
          updatedCommande.MatriculePn || updatedCommande.MatriculeDirTunCater,
        notificationType: "commande",
      });
      if (updatedCommande.MatriculePn) {
        global.io.emit("newNotification", {
          _id: notifcreer._id,
          message: notifcreer.message,
          createdAt: notifcreer.createdAt,
          user: notifcreer.user,
          notificationType: notifcreer.notificationType,
        });
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
