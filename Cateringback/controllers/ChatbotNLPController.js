const { NlpManager } = require("node-nlp");
const Recommandation = require("../controllers/RecommandationController");
const Menu = require("../controllers/menuController");
const Meal = require("../controllers/mealController");
const commande = require("../controllers/commandeController");
const manager = new NlpManager({ languages: ["fr"], forceNER: true });


//cette entité permet d'extraaire le num de vol
manager.addRegexEntity("numVol", "fr", /\b(?:vol\s*)?([A-Z]{2}\d{2,4})\b/gi);

manager.addDocument("fr", "bonjour", "greeting");
manager.addDocument("fr", "salut", "greeting");
manager.addDocument("fr", "Je veux commander des plats", "Commande.Meal");
manager.addDocument("fr", "Je voudrais un plat", "Commande.Meal");
manager.addDocument("fr", "Je veux commander un menu", "Commande.Menu");
manager.addDocument("fr", "Je choisi le menu", "Commande.Menu");
manager.addDocument("fr", "quels sont les menus disponibles ?", "Menu");
manager.addDocument("fr", "quels sont les plats disponibles ?", "Meal");
manager.addDocument("fr", "liste des plats", "Meal")
manager.addDocument("fr", "liste des menus", "Menu");
manager.addDocument("fr", "que me conseillez-vous ?", "Recommandation.generale");
manager.addDocument("fr", "tu me propose qoui ?", "Recommandation.generale");
manager.addDocument("fr", "Je veux des récommandations", "Recommandation.generale");
manager.addDocument("fr", "Il ya un menu du jour ?", "Recommandation.Menu");
manager.addDocument("fr","il ya t-il des récommandations a partir du ma carnet de santé? ","Recommandation.CarnetSante");
manager.addDocument("fr", "Je veux menu a partir de mon régimz ?", "Recommandation.CarnetSante");
manager.addDocument("fr", "propose moi quelque chose selon mes anciennes commandes", "Recommandation.Historique");
manager.addDocument("fr", "tu te souviens de ce que j'ai commandé ?", "Recommandation.Historique");
//****les réponses */
manager.addAnswer("fr", "greeting", "Bonjour ! Comment puis-je vous aider ?");
manager.addAnswer("fr", "greeting", "Bonjour ! qu'est ce que tu veux commander pour aujourd'hui?");
//la sessions des users
const userSessions = new Map();

(async () => {
  await updateMealEntities(); 
  await updateMenuEntities(); 
  await manager.train();
  manager.save("model.nlp");
})();

async function updateMealEntities() {
  try {
    const meals = await Meal.getAllMeals();
    meals.forEach((meal) => {
      manager.addNamedEntityText(
        "meal",
        meal.nom.toLowerCase(),
        ["fr"],
        [meal.nom, meal.nom.toLowerCase()]
      );
    });
  } catch (err) {
    console.error("Erreur mise à jour des plats:", err);
  }
}

async function updateMenuEntities() {
  try {
    const menus = await Menu.getAllMenu();
    menus.forEach((menu) => {
      manager.addNamedEntityText(
        "menu",
        menu.nom.toLowerCase().replace(/\s+/g, ""),
        ["fr"],
        [menu.nom, menu.nom.toLowerCase(), menu.nom.replace(/\s+/g, ""),menu.nom.toLocaleLowerCase().replace(/\s+/g, "")]
      );
    });
  } catch (err) {
    console.error("Erreur mise à jour des menus:", err);
  }
}
async function extraireNumVol(message) {
  try {
    const response = await manager.process("fr", message);
    const EntiteVol = response.entities.find((e) => e.entity === "numVol");
    if (!EntiteVol) return null;
    const vol = EntiteVol.resolution?.value || EntiteVol.sourceText;
    const nombreVol = vol.replace(/\s+/g, "").toUpperCase();
    return nombreVol;
  } catch (error) {
    console.error("Erreur extraction vol:", error);
    return null;
  }
}
exports.chatbotMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const matricule = req.user.Matricule;

    if (!userSessions.has(matricule)) {
      userSessions.set(matricule, {
        plats: [],
        menu: null,
        vol: null,
        //step pour garder en mémoire dans quelle etat est user
        step: "init",
        lastActivity: Date.now(),
      });
    }
    const session = userSessions.get(matricule);
    session.lastActivity = Date.now();
    const response = await manager.process("fr", message);
    let reply =response.answer || "Je n'ai pas compris. Pouvez-vous reformuler ?";

    switch (session.step) {
      case "awaitingVol": {
        const vol = await extraireNumVol(message);
        if (vol) {
          session.vol = vol;
          if (session.previousIntent === "Commande.Meal") {
            session.step = "selectingMeals";
            reply = "Quels plats souhaitez-vous commander ?";
          } else if (session.previousIntent === "Commande.Menu") {
            session.step = "selectingMenu";
            reply = "Quel menu souhaitez-vous commander ?";
          } else if (session.previousIntent === "Recommandation.generale") {
            session.step = "recommandationconfirmation";
            const suggestion = await Recommandation.recommandationGenerale();
            if (suggestion?.type) {
              reply = `Voici une suggestion : ${suggestion}. Commander ? (oui/non)`;
              session.recommandation = suggestion;
            } else {
              reply = "Aucune recommandation disponible pour le moment";
              session.step = "init";
            }
          }else if (session.previousIntent === "Recommandation.Menu") {
            const menu = await Recommandation.getMenuJour();
            if (menu) {
              const description = [
                `Entrée : ${menu.PlatsEntree[0]?.nom}`,
                `Plat principal : ${menu.PlatsPrincipaux[0]?.nom}`,
                `Dessert : ${menu.PlatsDessert[0]?.nom}`,
                `Boisson : ${menu.Boissons[0]?.nom}`,
              ].join(", ");
              reply = `Voici le menu du jour:${menu.nom} ${description}. Souhaitez-vous le commander ? (oui/non)`;
              session.step = "recommandationconfirmation";
              session.recommandation = { type: "menu", data: menu };
            } else {
              reply = "Aucune menu du jour trouvé pour aujourd'hui";
              session.step = "init";
            }
          }else if(session.previousIntent === "Recommandation.Historique"){
            const suggestion= await Recommandation.HistoriqueCommandes(matricule);
            if(suggestion){
              session.step = "selectingMeals";
              session.plats =suggestion;
              reply = `Je vous recommande ces plats basés sur vos commandes précédentes : ${suggestion.map(p => p.nom).join(', ')}. Souhaitez-vous en commander certains ? (vous pouvez les modifier ou valider avec 'oui')`;
            }else{
              reply = "Désolé ! mais aucune récommandation des plats";
              session.step = "init";
            }
          }
        } else {
          reply = "Numéro de vol invalide. Format attendu : TN123";
        }
      break;
      }
      case "selectingMenu": {
        const menuEntity = response.entities.find((e) => e.entity === "menu");
        const menu = menuEntity
          ? menuEntity.sourceText.trim().toLowerCase().replace(/\s+/g, "")
          : null;
        if (menu) {
          const availableMenus = await Menu.getAllMenu();
          const foundMenu = availableMenus.find(
            (m) => m.nom.toLowerCase().replace(/\s+/g, "").trim() === menu
          );
          if (!foundMenu) {
            throw new Error("Menu non disponible");
          }
          await commande.RequestCommandeMenu(
            session.vol,
            foundMenu.nom,
            matricule
          );
          reply = `Menu "${foundMenu.nom}" commandé pour le vol ${session.vol} !`;
          userSessions.delete(matricule);
        }
        break;
      }
      case "selectingMeals": {
        const PlatEntity = response.entities.find((e) => e.entity === "meal");
        if (PlatEntity && Array.isArray(PlatEntity) && PlatEntity.length > 0) {
          const plats = PlatEntity.map((e) =>
            e.sourceText.trim().toLowerCase()
          );
          const m = await Meal.getAllMeals();
          const platsFound = m.filter((meal) =>
            plats.includes(meal.nom.toLowerCase().trim())
          );
          // Si des plats sont trouvés, les ajouter à la session
          if (platsFound.length > 0) {
            session.plats = [...new Set([...session.plats, ...platsFound])];
            if (session.plats.length < 3) {
              reply = "Veuillez choisir au moins 3 plats différents.";
            } else {
              session.step = "confirmingOrder";
              reply = `Vous avez choisi : ${session.plats
                .map((p) => p.nom)
                .join(", ")}. Souhaitez-vous finaliser la commande ? (oui/non)`;
            }
          } else {
            reply =
              "Désolé, je n'ai pas pu trouver ces plats dans notre menu. Pouvez-vous vérifier les noms et réessayer ?";
          }
        } else {
          const plats = message
            .split(/[\s,]+/)
            .map((p) => p.trim().toLowerCase());
          const m = await Meal.getAllMeals();
          const platsFound = m.filter((meal) =>
            plats.includes(meal.nom.toLowerCase().trim())
          );
          // Ajouter les plats trouvés à la session sans doublons
          if (platsFound.length > 0) {
            session.plats = [...new Set([...session.plats, ...platsFound])];

            if (session.plats.length < 3) {
              reply = `Plats sélectionnés : ${session.plats
                .map((p) => p.nom)
                .join(", ")}. Veuillez choisir au moins 3 plats différents.`;
            } else {
              session.step = "confirmingOrder";
              reply = `Merci. Vous avez choisi : ${session.plats
                .map((p) => p.nom)
                .join(", ")}. Souhaitez-vous finaliser la commande ? (oui/non)`;
            }
          } else {
            reply =
              "Désolé, je n'ai pas trouvé ces plats dans notre menu. Pouvez-vous essayer avec d'autres plats ?";
          }
        }
        break;
      }

      case "confirmingOrder": {
        if (message.toLowerCase() === "oui") {
          try {
            const [entree, plat, dessert, boisson] = session.plats;
            await commande.RequestCommandeMeal(
              session.vol,
              entree?.nom,
              plat?.nom,
              dessert?.nom,
              boisson?.nom,
              null, // pour le petit-déjeuner
              matricule
            );
            reply = `Votre commande a été enregistrée pour le vol ${session.vol}. Merci !`;
            userSessions.delete(matricule);
          } catch (err) {
            reply = `Erreur : ${err.message}`;
          }
        } else if (message.toLowerCase() === "non") {
          reply =
            "Commande annulée. Vous pouvez recommencer si vous le souhaitez.";
          userSessions.delete(matricule);
        } else {
          reply = "Souhaitez-vous finaliser la commande ? (oui/non)";
        }
        break;
      }
      case "recommandationconfirmation": {
        if(message.toLocaleLowerCase()==="oui"){
          if (!session.recommandation?.type) {
            reply = "Erreur de recommandation, veuillez réessayer";
            break;
          }
          if(session.recommandation.type==="menu"){
            const menu=session.recommandation.data;
            await commande.RequestCommandeMenu(
              session.vol,
              menu.nom,
              matricule
            );
            reply = `Commande enregistrée pour le vol ${session.vol}. Bon appétit !`;
            userSessions.delete(matricule);
          }else if (session.recommandation.type === "plats") {
            const plats=session.recommandation.data;
            const entree=plats['Entrée'];
            const platPrincipal=plats["Plat Principal"];
            const dessert=plats['Dessert'];
            const boisson=plats['Boisson'];
            await commande.RequestCommandeMeal(
              session.vol,
              entree?.nom,
              platPrincipal?.nom,
              dessert?.nom,
              boisson?.nom,
              null,
              matricule
            );
            reply = `Commande enregistrée avec la recommandation pour le vol ${session.vol}. Bon appétit !`;
            userSessions.delete(matricule);
          }
        }else if (message.toLowerCase() === "non") {
          reply = "Très bien. Souhaitez-vous autre chose ?";
          session.step = "init";
        } else {
          reply = "Souhaitez-vous commander cette recommandation ? (oui/non)";
        }
        break;
      }
      default:
        switch (response.intent) {
          case "Commande.Meal": {
            if (!session.vol) {
              session.previousIntent = "Commande.Meal";
              session.step = "awaitingVol";
              reply = "D'abord, quel est votre numéro de vol ? (ex:TN123)";
              break;
            }
            session.step = "selectingMeals";
            reply =
              "Quels plats souhaitez-vous commander ?" ||
              "Qu'est-ce que tu veux commander? ";
            break;
          }
          case "Commande.Menu": {
            if (!session.vol) {
              session.step = "awaitingVol";
              session.previousIntent = "Commande.Menu";
              reply = "D'abord, quel est votre numéro de vol ? (ex:TN123)";
              break;
            }
            session.step = "selectingMenu";
            reply = "Quel menu souhaitez-vous commander ?";
            break;
          }

          case "Menu": {
            const menus = await Menu.getAllMenu();
            reply = `Menus disponibles : ${menus.map((m) => m.nom).join(", ")}`;
            break;
          }
          case "Meal": {
            const p = await Meal.getAllMeals();
            reply = `Plats disponibles : ${p.map((m) => m.nom).join(", ")}`;
            break;
          }
          case "Recommandation.generale": {
            if (!session.vol) {
              session.step = "awaitingVol";
              session.previousIntent = "Recommandation.generale";
              reply = "D'abord, quel est votre numéro de vol ? (ex:TN123)";
              break;
            }
            const suggestion = await Recommandation.recommandationGenerale();
            if (suggestion?.type) {
              let rep;
              if (suggestion.type==="menu"){
                reply = `Voici une suggestion pour vous : ${suggestion.data.nom}-${suggestion.data.description}. Souhaitez-vous le commander ? (oui/non)`;
              }else{
                const plats = suggestion.data;
                rep=Object.entries(plats).map(([type,plat])=>`${type}:${plat.nom}`).join(',')
                reply = `Voici une suggestion pour vous : ${rep}. Souhaitez-vous le commander ? (oui/non)`;
              }
              session.step = "recommandationconfirmation";
              session.recommandation = suggestion;
            } else {
              reply = "Désolé, je n'ai pas de recommandation pour le moment.";
            }
            break;
          }
          case "Recommandation.Menu":{
            if (!session.vol) {
              session.step = "awaitingVol";
              session.previousIntent = "Recommandation.Menu";
              reply = "D'abord, quel est votre numéro de vol ? (ex:TN123)";
              break;
            }
            const menu = await Recommandation.getMenuJour();
            if(menu){
              const rep=[`Entrée:${menu.PlatsEntree[0]?.nom}`,`Plat Principal:${menu.PlatsPrincipaux[0]?.nom}`,`Dessert:${menu.PlatsDessert[0]?.nom}`,`Boisson:${menu.Boissons[0]?.nom}`].join(',');
              reply = `Voici le menu du jour:${menu.nom} ${rep}. Souhaitez-vous le commander ? (oui/non)`;
              session.step = "recommandationconfirmation";
              session.recommandation = { type: "menu", data: menu };
            }
          }
          case "Recommandation.Historique":{
            if (!session.vol) {
              session.step = "awaitingVol";
              session.previousIntent = "Recommandation.Historique";
              reply = "D'abord, quel est votre numéro de vol ? (ex:TN123)";
              break;
            }
            const suggestion= await Recommandation.HistoriqueCommandes(matricule);
            if(suggestion){
              session.step = "selectingMeals";
              session.plats =suggestion;
              reply = `Je vous recommande ces plats basés sur vos commandes précédentes : ${suggestion.map(p => p.nom).join(', ')}. Souhaitez-vous en commander certains ? (vous pouvez les modifier ou valider avec 'oui')`;
            }
          }
        }
    }

    res.json({ reply });
  } catch (err) {
    console.error("Erreur chatbot:", err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

// Nettoyage des sessions inactives
setInterval(() => {
  const now = Date.now();
  userSessions.forEach((session, matricule) => {
    if (now - session.lastActivity > 3600000) {
      userSessions.delete(matricule);
    }
  });
}, 60000);
