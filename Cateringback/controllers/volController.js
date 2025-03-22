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
            const newVol = new fligth({
              numVol,
              volName,
              Destination,
              DureeVol,
              dateVolDep,
              Escale: Escale ?? false,
              Commande: Commande ?? [],
              Depart,
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