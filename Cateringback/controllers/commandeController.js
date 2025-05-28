const commande = require("../models/Commande");
const Menu = require("../models/Menu");
const plat = require("../models/Plat");
const menucontroller = require("./menuController");
const platcontroller = require("./mealController");
const Vol = require("../models/vol");
const pn=require('../models/personnelnavigant');
const PersonnelTunisair=require('../models/PersonnelTunisairModel')
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
      const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
      const numeroCommande = `CMD-${randomPart}`;
      const vol = await Vol.findOne({numVol: numVol, dateVolDep: { $gte: new Date() },});
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
        throw new Error("Menu non disponible");
      }

      const menuId = menu._id;
      const persTunisair = await PersonnelTunisair.findOne({ Matricule });
      if (!persTunisair) throw new Error("Matricule invalide");
      const personnel = await pn.findOne({
        PersonnelTunisiarId: persTunisair._id,
      });
      console.log("Personnel courant :", personnel);
      if (personnel && personnel.TypePersonnel === "Technique") {
        const autreCommande = await commande.findOne({
          vol: volId,
          menu: menuId,
        });

        if (autreCommande && autreCommande.Matricule !== Matricule) {
          const autrePers = await PersonnelTunisair.findOne({
            Matricule: autreCommande.Matricule,
          });
          const autrePN = await pn.findOne({
            PersonnelTunisiarId: autrePers._id,
          });

          if (autrePN && autrePN.TypePersonnel === "Technique") {
            throw new Error(
              "Ce menu a déjà été commandé par un autre personnel technique sur ce vol. Veuillez commander un menu différent."
            );
          }
        }
      }
      // Vérification des délais de commande
      const now = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000);
      const dateVol = new Date(vol.dateVolDep);
      const diffMs = dateVol - now;
      const diffH = diffMs / (1000 * 60 * 60);
      if (diffH > 72) {
        throw new Error("Les commandes ne sont autorisées qu'à partir de 72 heures avant le vol.");
      }
      if (
        (["Tunis", "Monastir", "Djerba"].includes(vol.Depart) && diffH <= 3) ||
        (["Enfidha", "Sfax", "Tozeur", "Tabarka"].includes(vol.Depart) &&diffH <= 12)
      ) {
        throw new Error(`Les commandes pour les vols au départ de ${ vol.Depart} doivent être passées plus de ${vol.Depart === "Tunis" ? "3" : "12" } heures à l'avance.`);
      }
      const arrayplat = [
        ...menu.PlatsPrincipaux,
        ...menu.PlatsEntree,
        ...menu.PlatsDessert,
        ...menu.Boissons,
      ];
      const newCmd = await commande.create({
        numeroCommande,
        vol: volId,
        menu: menuId,
        plats: arrayplat,
        dateCommande: new Date(),
        Statut: "En attente",
        NombreCommande: cmdExist + 1,
        montantsTotal: 2.5,
        Matricule: Matricule || undefined,
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
    nomEntree = null,
    nomPlatPrincipal = null,
    nomDessert = null,
    nomBoissons = null,
    nomsPetitdejuner = null,
    Matricule
  ) {
    try {
      const randomPart = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      const numeroCommande = `CMD-${randomPart}`;
      const vol = await Vol.findOne({
        numVol: numVol,
        dateVolDep: { $gte: new Date() },
      });
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
      // Vérification des délais de commande
      const now = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000);
      const dateVol = new Date(vol.dateVolDep);
      const diffMs = dateVol - now;
      const diffH = diffMs / (1000 * 60 * 60);
      if (diffH > 72) {
        throw new Error(
          "Les commandes ne sont autorisées qu'à partir de 72 heures avant le vol."
        );
      }
      if (
        (["Tunis", "Monastir", "Djerba"].includes(vol.Depart) && diffH <= 3) ||
        (["Enfidha", "Sfax", "Tozeur", "Tabarka"].includes(vol.Depart) &&
          diffH <= 12)
      ) {
        throw new Error(
          `Les commandes pour les vols au départ de ${
            vol.Depart
          } doivent être passées plus de ${
            vol.Depart === "Tunis" ? "3" : "12"
          } heures à l'avance.`
        );
      }
      let platsArray = [];
      platsArray = [
        ...(Entree ? [Entree._id] : []),
        ...(PlatPrincipal ? [PlatPrincipal._id] : []),
        ...(Dessert ? [Dessert._id] : []),
        ...(Boissons ? [Boissons._id] : []),
      ];
      const newCmd = await commande.create({
        numeroCommande,
        vol: volId,
        plats: platsArray,
        dateCommande: new Date(),
        Statut: "En attente",
        NombreCommande: cmdExist + 1,
        montantsTotal: 2.5,
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
      return updatedCommande;
    } catch (error) {
      throw error;
    }
  }

  static async updateCommande(id, data) {
    //ici peut modifier data  cmd only if status=en attente(controle statut sur html) et il faut respecter les delais
    try {
      const cmd = await commande.findById(id).populate("vol");
      if (cmd.Statut !== "en attente") {
      throw new Error("Seules les commandes en attente peuvent être modifiées.");
      }
      const vol = cmd.vol;
      if (!vol) {
        throw new Error("Aucun vol associé à la commande");
      }
      const now = new Date(
        new Date().getTime() - new Date().getTimezoneOffset() * 60000
      );
      const dateVol = new Date(vol.dateVolDep);
      const diffH = (dateVol - now) / (1000 * 60 * 60); // Différence en heures
      if ( (["Tunis", "Monastir", "Djerba"].includes(vol.Depart) && diffH <= 3) ||(["Enfidha", "Sfax", "Tozeur", "Tabarka"].includes(vol.Depart) &&diffH <= 12)) {
        const heuresLimite = ["Tunis", "Monastir", "Djerba"].includes(vol.Depart) ? 3 : 12;
        throw new Error(`Les commandes pour les vols au départ de ${ vol.Depart } doivent être modifiées  plus de ${heuresLimite} heures à l'avance.`);
      }
      const cmdUpdate = await commande.findByIdAndUpdate(id, data, {new: true});
      return cmdUpdate;
    } catch (err) {
      throw err;
    }
  }
  static async annulationCommandeVol(id){
    try{
      const cmd=await commande.findById(id);
      if (!cmd) {
        throw new Error("Command request not found");
      }
      cmd.Statut="annulé";
      await cmd.save();
      return cmd;
    }catch(err){
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
      const now = new Date(
        new Date().getTime() - new Date().getTimezoneOffset() * 60000
      );
      const dateVol = new Date(vol.dateVolDep);
      const diffH = (dateVol - now) / (1000 * 60 * 60); // Différence en heures
      if ( (["Tunis", "Monastir", "Djerba"].includes(vol.Depart) && diffH <= 3) ||(["Enfidha", "Sfax", "Tozeur", "Tabarka"].includes(vol.Depart) &&diffH <= 12)) {
        const heuresLimite = ["Tunis", "Monastir", "Djerba"].includes(vol.Depart) ? 3 : 12;
        throw new Error(`Les commandes pour les vols au départ de ${ vol.Depart } doivent être annulées  plus de ${heuresLimite} heures à l'avance.`);
      }
      cmd.Statut = "annulé";
      await cmd.save();
    } catch (err) {
      throw err;
    }
  }
  //Des status automatque
  static async updateeStautAuto(){
    const now=new Date();
    const cmd = await commande
      .find({
        Statut: { $in: ["en attente"] },
      })
      .populate({
        path: "vol",
        select: "dateVolDep",
      });
      for(let c of cmd){
        const dateDep = new Date(c.vol.dateVolDep);//exempl:21h
        const heurFerm = new Date(dateDep.getTime()-60*60*1000);//les commandes se ferme apres 1Heurs
        const heurPreparation = new Date(heurFerm.getTime()+20*60*1000);//dans 15 min etre prepare les commandes +5 min retard 
        if (now > heurPreparation && now < dateDep &&c.Statut === "en attente"){
          c.Statut = "en retard";
          await c.save();
          continue;
        }
        if(now > dateDep && c.Statut !== "livré" && c.Statut !== "prêt" ){
          c.Statut="annulé"
          await c.save();
        }
      }
  }
}

module.exports = CommandeController;
