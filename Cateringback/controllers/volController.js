const fligth=require("../models/vol");
class volController{
    static async createfligth(numVol, volName, Destination, DureeVol, dateVolDep, Escale, Commande){
        try{
            if (!numVol || !volName || !Destination || !DureeVol || !dateVolDep) {
                console.log("Tous les champs obligatoires doivent être remplis.");
            }
            const newVol = new fligth({
                numVol,
                volName,
                Destination,
                DureeVol,
                dateVolDep,
                Escale:Escale??false,
                Commande:Commande??[]
            });
            await newVol.save();
            console.log("vol créé");
            return newVol;
        }catch(err){
            console.log(err);
        }
    }
}
module.exports=volController;