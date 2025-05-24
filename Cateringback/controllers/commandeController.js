const commande = require("../models/Commande");
const Menu = require("../models/Menu");
const plat = require("../models/Plat");
const menucontroller = require("./menuController");
const platcontroller = require("./mealController");
const Vol = require("../models/vol");
const notification = require("../models/NotificationModel");

class CommandeController {
  // Return all orders
  static async getAllCommands() {
    try {
      const commandes = await commande
        .find()
        .populate("Matricule", "Matricule nom")
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
      const vol = await Vol.findOne({ numVol });

      if (!vol) {
        throw new Error(`Aucun vol trouvé avec le numéro ${numVol}`);
      }
      const commandes = await commande
        .find({ vol: vol._id })
        .populate({ path: "menu", select: "nom" })
        .populate({ path: "plats", select: "nom" })
        .populate({ path: "Matricule", select: "nom prenom Matricule" });

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
  static async getMyOrders(Matricule) {
    try {
      const Myorders = await commande
        .find({ Matricule: Matricule })
        .populate("vol")
        .populate("menu")
        .populate("plats");
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

  // Return order by ID==detail
  static async getCommandByID(id) {
    try {
      const cmd = await commande
        .findById(id)
        .populate("Matricule", "Matricule dateVolDep numVol")
        .populate("nomMenu", "nom");
      if (!cmd) {
        throw new Error("Commande not found");
      }
      return cmd;
    } catch (error) {
      throw new Error("Error retrieving command: " + error.message);
    }
  }
  
  // Order Menu
  static async RequestCommandeMenu(numVol, nom, Matricule) {
    try {
      const vol = await Vol.findOne({ numVol: numVol, dateVolDep: { $gte: new Date() } });
      if (!vol) {
        throw new Error("Flight not found");
      }

      const volId = vol._id;
      const dureeVol = parseInt(vol.DureeVol);
      const cmdExist = await commande.countDocuments({
        vol: volId,
        Matricule,
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
      const now = new Date();
      const date = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
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
      const arrayplat = [
        ...menu.PlatsPrincipaux,
        ...menu.PlatsEntree,
        ...menu.PlatsDessert,
        ...menu.Boissons,
      ];
      const newCmd = await commande.create({
        vol: volId,
        menu: menuId,
        plats:arrayplat,
        dateCommnade: date,
        Statut: "En attente",
        NombreCommande: cmdExist + 1,
        montantsTotal:2.5,
        Matricule: Matricule || undefined,
      });
      await menucontroller.miseajourmenuCommande(nom);
      const notifcreer = await notification.create({
        message: `Nouvelle commande créée pour le vol ${numVol}`,
        user: Matricule,
        notificationType: "commande",
      });
      global.io.emit("newNotification", {
        _id: notifcreer._id,
        message: notifcreer.message,
        createdAt: notifcreer.createdAt,
        user: notifcreer.user,
        notificationType: notifcreer.notificationType,
        destinataire: Matricule,
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
    Matricule
  ) {
    try {
      const vol = await Vol.findOne({ numVol: numVol,dateVolDep: { $gte: new Date() } });
      if (!vol) {
        throw new Error("Flight not found");
      }

      const volId = vol._id;
      const dureeVol = parseInt(vol.DureeVol);
      const cmdExist = await commande.countDocuments({
        vol: volId,
        Matricule,
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
      const now = new Date();
      const date = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
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
      let platsArray = [];
        platsArray = [
          ...(Entree ? [Entree._id] : []),
          ...(PlatPrincipal ? [PlatPrincipal._id] : []),
          ...(Dessert ? [Dessert._id] : []),
          ...(Boissons ? [Boissons._id] : []),
        ];
      const newCmd = await commande.create({
        vol: volId,
        plats: platsArray,
        dateCommande: date,
        Statut: "En attente",
        NombreCommande: cmdExist + 1,
        montantsTotal:2.5,
        Matricule: Matricule || undefined,
      });
      if (Boissons) {
        await platcontroller.miseajourquantite(
          Entree,
          PlatPrincipal,
          Dessert,
          Boissons
        );
      } else if (Petitdejeuner.length > 0) {
        await platcontroller.miseajourqtePetitdejuner(Petitdejeuner);
      } else {
        await platcontroller.miseajourquantite(Entree, PlatPrincipal, Dessert);
      }

      // Send notification
      const notifcreer = await notification.create({
        message: `Nouvelle commande créée pour le vol ${numVol}`,
        user: Matricule,
        notificationType: "commande",
      });

      global.io.emit("newNotification", {
        _id: notifcreer._id,
        message: notifcreer.message,
        createdAt: notifcreer.createdAt,
        user: notifcreer.user,
        notificationType: notifcreer.notificationType,
        destinataire: Matricule,
      });

      console.log("Commande bien enregistrée");
      return newCmd;
    } catch (err) {
      console.error("Error creating meal order:", err.message);
      throw new Error("Error creating meal order: " + err.message);
    }
  }
  //for tunisie catering , for tunisair if fligth canceled
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
          updatedCommande.Matricule,
        notificationType: "commande",
      });
      global.io.emit("newNotification", {
          _id: notifcreer._id,
          message: notifcreer.message,
          createdAt: notifcreer.createdAt,
          user: notifcreer.user,
          notificationType: notifcreer.notificationType,
          destinataire: updatedCommande.Matricule,
      });
      return updatedCommande;
    } catch (error) {
      throw error;
    }
  }

  static async updateCommande(id, data) {
    //ici peut modifier data  cmd only if status=en attente(controle statut sur html) et il faut respecter les delais
    try {
      const cmd = await commande.findById(id).populate("vol");
      if (!cmd) {
        throw new Error("Command request not found");
      }
      const vol = cmd.vol;
      if (!vol) {
        throw new Error("Aucun vol associé à la commande");
      }
      const now = new Date();
      const date = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      const deadline = new Date(vol.dateVolDep);
      const debutAutorise = new Date(deadline);
      debutAutorise.setHours(deadline.getHours() - 4, 0, 0, 0);
      const finAutorise = new Date(deadline);
      finAutorise.setHours(deadline.getHours() - 1, 0, 0, 0);
      if (date < debutAutorise || date > finAutorise) {
        throw new Error(
          `Modification autorisée uniquement entre ${debutAutorise.toLocaleTimeString(
            [],
            { hour: "2-digit", minute: "2-digit" }
          )} et ${finAutorise.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })} avant le départ du vol`
        );
      }
      const cmdUpdate = await commande.findByIdAndUpdate(id, data, {
        new: true,
      });
      return cmdUpdate;
    } catch (err) {
      throw err;
    }
  }
  //pn annule commande
  static async annulCmd(id) {
    try {
      const cmd = await commande.findById(id).populate("vol");
      if (!cmd) {
        throw new Error("Command request not found");
      }
      if (cmd.Statut !== "en attente") {
        throw new Error("Commande status est deja en processus");
      }
      const vol = cmd.vol;
      if (!vol) {
        throw new Error("Aucun vol associé à la commande");
      }
      const now = new Date();
      const date = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      const deadline = new Date(vol.dateVolDep);
      const debutAutorise = new Date(deadline);
      debutAutorise.setHours(deadline.getHours() - 4, 0, 0, 0);
      const finAutorise = new Date(deadline);
      finAutorise.setHours(deadline.getHours() - 1, 0, 0, 0);
      if (date < debutAutorise || date > finAutorise) {
        throw new Error(
          `Modification autorisée uniquement entre ${debutAutorise.toLocaleTimeString(
            [],
            { hour: "2-digit", minute: "2-digit" }
          )} et ${finAutorise.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })} avant le départ du vol`
        );
      }
      cmd.Statut = "annulé";
      await cmd.save();
    } catch (err) {
      throw err;
    }
  }
}

module.exports = CommandeController;
