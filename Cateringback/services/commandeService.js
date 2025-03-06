const commande=require("../models/Commande");
const personnel=require("../models/personnelnavigant");
const menu=require("../models/Menu");
const vol=require("../models/vol");


class CommandeService{
    static async getAllCommands(){
        try{
            return await commande
              .find()
              .populate("MatriculePn", "Matricule dateVolDep numVol")
              .populate("nomMenu", "nom");
        }catch(error){
            throw new Error("error retreiveing commands:"+error);
        }
    }
    static async getTotatCommand(){
        try{
            return await commande.countDocuments();
        }catch(error){
            throw new Error("error retreiveing commands:"+error);
        }
    }
    static async getCommandByID(id){
        try{
            const cmd=await commande.findById(id).populate("MatriculePn","Matricule dateVolDep  numVol").populate("nomMenu","nom");
        if(!cmd){
            throw new Error("commande not found");
        }
        }catch(error){
            throw new Error("error retreiveing commands:"+error);
        }
    }
    static async createCommandRequest(menuID,pnID){
        try{
            const personnelnavigant=await personnel.findById(pnID).populate("vols");
            if(!personnelnavigant){
                throw new Error("personnel navigant not found");
            }
             if (!personnelnavigant.vols.length) {
               throw new Error("Aucun vol associé à ce personnel navigant");
             }
             const vol = await Vol.findById(
               personnelnavigant.vols[personnelnavigant.vols.length - 1]
             );
             if (!vol) {
               throw new Error("Vol non trouvé");
             }
            const menuu=await menu.findById(menuID);
            if(!menuu){
                throw new Error("menu not found");
            }
            const newcommande = await commande.create({
              MatriculePn: personnel.Matricule,
              nomMenu: menu.nom,
              dateVolDep: vol.dateVolDep,
              numVol: vol.numVol,
              NombreCommande:menu.length
            });
                await newcommande.save();
                return newcommande;
        }catch(error){
                    throw new Error("error creating commande request:"+error);
        }

        }
    }

module.exports=CommandeService;