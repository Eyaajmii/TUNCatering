const fligth=require("../models/vol");
class volController{
    static async createfligth(numVol, volName, Destination, DureeVol, dateVolDep, Escale, Commande,Depart){
        try{
            if (!numVol || !volName || !Destination || !DureeVol || !dateVolDep||!Depart) {
                console.log("Tous les champs obligatoires doivent être remplis.");
            }
            const existingvol = await fligth.findOne({ numVol });
            if (existingvol) {
              console.log("Ce vol est déjà utilisé.");
            }
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
}
module.exports=volController;