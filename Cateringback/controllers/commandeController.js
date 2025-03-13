const commande=require("../models/Commande");
const personnel=require("../models/personnelnavigant");
const menu=require("../models/Menu");
const vol=require("../models/vol");


class CommandeController{
  static async getAllCommands() {
    try {
        if (commande.MatriculePn){
            return await commande
              .find()
              .populate("MatriculePn", "Matricule dateVolDep numVol")
              .populate("nomMenu", "nom");
        }
        return commande
          .find()
          .populate("MatriculeResTun", "Matricule")
          .populate("nomMenu", "nom").populate;
    } catch (error) {
      throw new Error("error retreiveing commands:" + error);
    }
  }
  static async getTotatCommand() {
    try {
      return await commande.countDocuments();
    } catch (error) {
      throw new Error("error retreiveing commands:" + error);
    }
  }
  static async getCommandByID(id) {
    try {
      const cmd = await commande
        .findById(id)
        .populate("MatriculePn", "Matricule dateVolDep  numVol")
        .populate("nomMenu", "nom");
      if (!cmd) {
        throw new Error("commande not found");
      }
    } catch (error) {
      throw new Error("error retreiveing commands:" + error);
    }
  }
  static async createCommandRequest(menuID, pnID) {
    try {
      const personnelnavigant = await personnel.findById(pnID).populate("vols");
      if (!personnelnavigant) {
        throw new Error("personnel navigant not found");
      }
      if (!personnelnavigant.vols.length) {
        throw new Error("Aucun vol associé à ce personnel navigant");
      }
      const Vol = await vol.findById(
        personnelnavigant.vols[personnelnavigant.vols.length - 1]
      );
      if (!Vol) {
        throw new Error("Vol non trouvé");
      }
      const menuu = await menu.findById(menuID);
      if (!menuu) {
        throw new Error("menu not found");
      }
      const newcommande = await commande.create({
        MatriculePn: personnel.Matricule,
        nomMenu: menu.nom,
        dateVolDep: Vol.dateVolDep,
        numVol: Vol.numVol,
        NombreCommande: menu.length,
        Statut: "En attente",
        NombreCommande:1
      });
      await newcommande.save();
      return newcommande;
    } catch (error) {
      throw new Error("error creating commande request:" + error);
    }
  }
  //admin modifie statut
  static async updateCommandeStatus(id, status) {
    try {
      const Updatecommande = await commande.findByIdAndUpdate(id, {
        statut: status,
      });
      if (!Updatecommande) {
        throw new Error("commande request not found");
      }
      return Updatecommande;
    } catch (error) {
      throw new Error("error updating commande status:" + error);
    }
  }
  static async cancelcommandeRequest(id) {
    try {
      const Cancelcommande = await commande.findById(id);
      if (!Cancelcommande) {
        throw new Error("Command request not found");
      }
      if (Cancelcommande.Statut !== "En attente") {
        throw new Error(
          "Command request cannot be canceled, it has already been processed"
        );
      }
      await commande.findByIdAndDelete(id);
      return { message: "Command request canceled successfully" };
    } catch (error) {
      throw new Error("Error canceling Command request: " + error.message);
    }
  }
}

module.exports = CommandeController;