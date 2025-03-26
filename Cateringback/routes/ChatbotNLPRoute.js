const express=require("express");
const router = express.Router();
const chatbot=require("../controllers/ChatbotNLPController");

router.post("/message",async(req,res)=>{
    try{
        const {message}=req.body;
        const response=await manager.process("fr",message);
        const intent=response.intent;

        let reply="Je n'ai pas compris. Pouvez-vous reformuler?";
        switch(intent){
            case "greeting":
                reply="Bonjour, comment puis-je vous aider aujourd'hui?";
                break;
            case"Commande.Recommandation":
                reply="Voici des plats que je vous recommande.";
                break;
            case'Commande.Meal':
                 reply = "Quel type de plat souhaitez-vous ? Entrée, plat principal ou dessert ?";
                break;
            case 'Menu':
                reply = "Voici les menus disponibles : ";
                break;
            case 'Commande.Menu':
                reply = "Quel est le menu que vous souhaitez commander ?";
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