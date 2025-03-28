const express=require("express");
const router = express.Router();
const {manager}=require("../controllers/ChatbotNLPController");
const Recommandation=require("../controllers/RecommandationController");
const Menu=require("../controllers/menuController");
const Meal=require("../controllers/mealController");
router.post("/message",async(req,res)=>{
    try{
        const {message}=req.body;
        const response=await manager.process("fr",message);
        const intent=response.intent;

        let reply="Je n'ai pas compris. Pouvez-vous reformuler?";
        switch (intent) {
          case "greeting":
            reply = "Bonjour, comment puis-je vous aider aujourd'hui?";
            break;
          case "Recommandation":
            const r = await Recommandation.getMenuJour();
            reply =
              "Voici le menu du jour que je vous recommande pour vous :" +
              r.map((nomM) => nomM.nom).join(",");
            break;
          case "Commande.Meal":
            reply = "Quel type de plat souhaitez-vous ?";
            break;
          case "Menu":
            const m = await Menu.getAllMenu();
            reply =
              "Voici les menus disponibles : " +
              m.map((nomM) => nomM.nom).join(",");
            break;
          case "Commande.Menu":
            reply = "Quel est le menu que vous souhaitez commander ?";
            break;
          case "Commande.Meal":
            const meals = await Meal.getAllMeal();
            reply =
              "Bien sûr ! Voici les plats disponibles : " +
              meals.map((m) => m.nom).join(", ");
            break;

          default:
            if (response.answer) {
              reply = response.answer;
            }
        }
        res.json({reply})
    }catch(err){
        console.log(err);
    }
});

module.exports=router;