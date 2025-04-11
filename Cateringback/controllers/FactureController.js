const facture=require("../models/FactureModel");
const bnlivraison=require("../models/bonLivraison");
const vol=require("../models/vol");
class FactureController{
    static async creerFacture(date){
        try{
            if(!date){
                throw new Error("Date requis");
            }
            //Extraire le debut et le fin du date pour avoir 
            //tous les vols dans tous les heurs
            const debut = new Date(date).setHours(0,0,0,0);
            const fin = new Date(date).setHours(23,59,59,999);

            const vols = await vol.find({ dateVolDep:{$gte:debut,$lte:fin}});
            if(vols.length===0){
                throw new Error("Aucun vol trouvé");
            }
            //find all bn livraison include vols
            const bnLivraisons = await bnlivraison.find({ volInfo: { $in: vols.map((vol) => vol._id) } })
              //populate infos des comamndes + les menus et les personnels
              .populate({
                path: "commandes",
                populate: [
                  { path: "menu", select: "nom" },
                  { path: "plats", select: "nom" },
                  { path: "MatriculePn", select: "Matricule" },
                  { path: "MatriculeDirTunCater", select: "Matricule" },
                ],
            });
            //filtrer les bons non livré
            const bnNonLivre = bnLivraisons.filter((bn) => bn.Statut!==Livré);
            if(bnNonLivre.length>0){
                const message = bnNonLivre
                  .map((b) => `Bon ${b.numeroBon} non validé`)
                  .join(", ");
                return { success: false, message };
            }
            const newFacture=new facture({
                numeroFacture:"FCT-"+Date.now(),
                DateFacture:debut,
                Statut:"En attente",
                bnLivraisons:bnLivraisons.map((bn)=>bn._id),
            });
            let montanttotal=0;
            //srocker tous les monatnt par vol
            const montantVols=[];
            //map pour prendre les montants par personnels
            const montantPN=new Map();
            //Calcule des montant
            for(const bn of bnLivraisons){
                let montantVol=0;
                for(const commande of bn.commandes){
                    const montant = commande.montantsTotal ||0;
                    montantVol+=montant;

                    let pn = null;
                    if(commande.MatriculePn){
                        pn = commande.MatriculePn._id?.toString();
                    }else if(commande.MatriculeDirTunCater){
                        pn = commande.MatriculeDirTunCater._id?.toString();
                    }
                    if(pn){
                        montantPN.set(pn, (montantPN.get(pn) || 0)+montant);
                    }
                }
                montantVols.push({ vol: bn.volInfo, montant: montantVol });
                montanttotal += montantVol;
            }
            //Save montants in the db
            newFacture.montantTotal = montanttotal;
            newFacture.montantParVol = montantVols.map((m) => ({
              vol: m.vol._id,
              montant: m.montant,
            }));
            newFacture.montantParPn = Array.from(montantPN.entries()).map(
              ([id, montant]) => ({
                personnel: id,
                montant,
              })
            );
            await newFacture.save();
            console.log(newFacture);
        }catch(err){
            console.log(err);
        }
    }
}
module.exports = FactureController;