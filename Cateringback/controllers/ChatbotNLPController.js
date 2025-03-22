//Source:https://medium.com/@ramprasadhnatarajan/basic-chatbotserver-using-node-js-express-and
//-node-nlp-library-70908573a6ba
const {NlpManager}=require('node-nlp');
const commandeController=require("../controllers/commandeController");
//const commande=require("../models/Commande");
//const plat=require("../models/Meal")
const manager = new NlpManager({ languages: ['fr'],forceNER:true });
//===========Questions========
manager.addDocument("fr", "Bonjour", greeting);
manager.addDocument("fr", "Salut", greeting);
manager.addDocument("fr", "Comment ça va?", greeting);
manager.addDocument("fr","Bonsoir",greeting)
//Commander un repas
manager.addDocument("fr", "je voudrais commander mon repas pour aujourd'hui ","Commande.Meal");
manager.addDocument("fr", "je voudrais commander mon repas","Commande.Meal");
//Les plats disponibles
manager.addDocument("fr","Montrez-moi les plats disponibles","Meal")
manager.addDocument("fr","Quels sont les plats disponibles?","Meal");
//Recommandations
manager.addDocument("fr","as tu des récommandations ?")
manager.addDocument("fr","Avez-vous des autres options?");
manager.addDocument("fr","Il ya t'il déja des menus disponibles?");
//=================Réponses==========
manager.addAnswer("fr","greeting","Bonjour,bonne journée!");
manager.addAnswer("fr","greeting","Super bien ! Comment puis-je vous aider?");
manager.addAnswer("fr","greeting","Bonsoir, comment puis-je vous aider ?");
manager.addAnswer("fr", "greeting", "Bonjour,  comment puis-je vous aider ?");
manager.addAnswer("fr", "greeting", "Salut,Prêt a commander?");
manager.addAnswer("fr", "Meal", "Bien sur!Voici les plats dipsonibles");
