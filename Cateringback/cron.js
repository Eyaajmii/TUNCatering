const cron = require("node-cron");
const bn=require('./models/bonLivraison');
cron.schedule("* * * * *", async() => {
    try {
      const now = new Date();
      const bons = await bn.find({Statut:'En attente'})
        .populate("vol")

      for (const bon of bons) {
        if (
          bon.vol &&
          bon.vol.dateVolDep instanceof Date &&
          bon.vol.dateVolDep <= now
        ) {
          bon.Statut = "Annulé";
          bon.conformite = "Non confirmé";
          await bon.save();

          console.log(
            ` Bon de Livraison ${bon.numeroBon} annulé automatiquement : vol ${bon.vol.numVol} déjà parti (${bon.vol.dateVolDep})`
          );
        }
      }
    } catch (error) {
      console.error(" Erreur lors de l'exécution de la tâche CRON :", error);
    }
});
