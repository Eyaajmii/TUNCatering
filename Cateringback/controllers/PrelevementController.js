const prelevement=require("../models/PrelevementModel");
const facture=require("../models/FactureModel");
class PrelevementController{
    static async creerPrelvement(dateDebut,dateFin){
        try{
            const debut=new Date(dateDebut);
            const fin = new Date(dateFin);
            fin.setHours(23,59,59,999);
            const factures=await facture.find({DateFacture:{$gte:debut,$lte:fin},Statut:"confirmé"});
            const mapMontants=new Map();
            for(const f of factures){
                for(const m of f.montantParPn){
                    const p=m.personnel.toString();
                    mapMontants.set(p, (mapMontants.get(p) || 0) + m.montant);
                }
            }
            const result=[];
            for (const [personnelId, montant] of mapMontants.entries()) {
                //result.push({ MatriculePn: personnelId, montantTotal:montant });
                const create = await prelevement.create({
                    personnel: personnelId,
                    montantTotal: montant,
                    dateDebut:debut,
                    dateFin: fin 
                })
                result.push(create);
            }
            return result;
        }catch(err){
            console.error("Erreur lors de la créattion du prelevement:", err);
            throw err;
        }
    }
}
module.exports = PrelevementController;