const fligth=require("../models/vol");
class volController{
    static async createfligth(numVol, volName, Destination, DureeVol, dateVolDep, Escale, Commande,Depart){
        try{
            const newVol = await fligth.create({
              numVol,
              volName,
              Destination,
              DureeVol,
              dateVolDep,
              Escale: Escale ?? false,
              Commande: Commande ?? [],
              Depart,
            });
            console.log("vol créé");
            return newVol;
        }catch(error){
            console.log(error);
        }
  }
  static async VolsJours(){
        try {
        const Jour = new Date();
        const prochainJour=new Date(Jour.getTime() + 48 * 60 * 60 * 1000);
        const vols = await fligth
          .find({
            dateVolDep: {
              $gte: Jour,
              $lte: prochainJour,
            },
          })
          .populate("numVol");
        console.log("Vols des prochaines 48h",vols);
        return vols;
    } catch (error) {
        throw error;
    }
    };
}
module.exports=volController;