//Source:https://medium.com/@ramprasadhnatarajan/basic-chatbotserver-using-node-js-express-and
//-node-nlp-library-70908573a6ba
const {NlpManager}=require('node-nlp');
const manager = new NlpManager({ languages: ['fr'],forceNER:true });
//===========Questions========
manager.addDocument("fr", "Bonjour", greeting);
manager.addDocument("fr", "Salut", greeting);
manager.addDocument("fr", "Comment ça va?", greeting);
manager.addDocument("fr","Bonsoir",greeting)
//Commander un repas
manager.addDocument("fr", "je voudrais commander mon repas pour aujourd'hui ","Commande.Meal");
manager.addDocument("fr", "je voudrais commander mon repas","Commande.Meal");
manager.addDocument("fr","Je veux commander les plats suivants : ","Commande.Meal");
//Les plats 
manager.addDocument("fr","Montrez-moi les plats disponibles","Meal")
manager.addDocument("fr","Quels sont les plats disponibles?","Meal");
//Recommandations
manager.addDocument("fr","as tu des récommandations ?","Recommandation")
manager.addDocument("fr","Avez-vous des autres options?","Recommandation");
//Menus
manager.addDocument("fr","Il ya t'il déja des menus disponibles?","Menu");
manager.addDocument("fr", "je voudrais commander ce menu", "Commande.Menu");
manager.addDocument("fr", "j'aime ce menu'", "Commande.Menu");

manager.addDocument("fr", "je suis satisfait(e) merci !", "greeting");
//=================Réponses==========
manager.addAnswer("fr","greeting","Bonjour,bonne journée!");
manager.addAnswer("fr","greeting","Super bien ! Comment puis-je vous aider?");
manager.addAnswer("fr","greeting","Bonsoir, comment puis-je vous aider ?");
manager.addAnswer("fr", "greeting", "Bonjour,  comment puis-je vous aider ?");
manager.addAnswer("fr", "greeting", "Salut,Prêt a commander?");
//reponse commande repas
manager.addDocument("fr","Commande.Meal","Trés bien , pour commande votre repas, veuillez donner le numero de vol et ton choix de repas");
manager.addAnswer("fr","Commande.Meal","Trés bien , Tu veux des récommandations ?");
manager.addAnswer("fr","Commande.Meal","Commande bien passée. A la prochaine !");
//Les plats
manager.addAnswer("fr", "Meal", "Bien sur!Voici les plats dipsonibles : ");
//recommandations
manager.addAnswer("fr", "Recommandation","Bien sur ! d'aprés votre historique des commandes : ");
manager.addAnswer("fr", "Recommandation","Bien sur ! d'aprés votre carnet du santé : ");
manager.addAnswer("fr", "Recommandation","Bien sur ! je veux recommande d'essayer notre menu du jour :  ");
//menu
manager.addAnswer("fr", "Menu","Bien sur ! Voici les menus disponibles : ");

//Le processus
(async () => {
  await manager.train();
  manager.save();
  const response = await manager.process("fr", "Je devrais y aller maintenant");
  console.log(response);
})();


