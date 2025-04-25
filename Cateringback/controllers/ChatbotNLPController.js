const { NlpManager } = require("node-nlp");
const Recommandation = require("../controllers/RecommandationController");
const Menu = require("../controllers/menuController");
const Meal = require("../controllers/mealController");
const commande = require("../controllers/commandeController");

const manager = new NlpManager({ languages: ["fr"], forceNER: true });

// ========== ENTITÉS NLP ==========
// Entité pour extraire le numéro de vol
manager.addRegexEntity("numVol", "fr", /vol\s*(\w+)/i);


// ========== DOCUMENTS D'ENTRAÎNEMENT ==========
manager.addDocument("fr", "bonjour", "greeting");
manager.addDocument("fr", "salut", "greeting");
manager.addDocument("fr", "je veux commander des plats", "Commande.Meal");
manager.addDocument("fr", "je voudrais un plat", "Commande.Meal");
manager.addDocument("fr", "commander un menu", "Commande.Menu");
manager.addDocument("fr", "choisir un menu", "Commande.Menu");
manager.addDocument("fr", "quels sont les menus disponibles ?", "Menu");
manager.addDocument("fr", "que me conseillez-vous ?", "Recommandation");

// ========== RÉPONSES PAR DÉFAUT ==========
manager.addAnswer("fr", "greeting", "Bonjour ! Comment puis-je vous aider ?");
manager.addAnswer(
  "fr",
  "Commande.Meal",
  "Quels plats souhaitez-vous commander ?"
);
manager.addAnswer(
  "fr",
  "Commande.Menu",
  "Quel menu souhaitez-vous commander ?"
);
manager.addAnswer("fr", "Menu", "Voici les menus disponibles :");

// Sessions utilisateur
const userSessions = new Map();

// Entraînement du modèle NLP
(async () => {
  await manager.train();
  await updateMealEntities(); // Ajoute les plats en entité
  await updateMenuEntities(); // Ajoute les menus en entité
  manager.save("model.nlp");
  console.log("Modèle NLP entraîné et prêt !");
})();

// ========== AJOUT DES ENTITÉS ==========

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
        menu.nom.toLowerCase(),
        ["fr"],
        [menu.nom, menu.nom.toLowerCase()]
      );
    });
  } catch (err) {
    console.error("Erreur mise à jour des menus:", err);
  }
}

// Extraction d'informations du message
async function extractFlightNumber(message) {
  const response = await manager.process("fr", message);
  return response.entities
    .find((e) => e.entity === "numVol")
    ?.sourceText?.match(/\d+/)?.[0];
}

async function extractMeals(message) {
  const response = await manager.process("fr", message);
  return response.entities
    .filter((e) => e.entity === "meal")
    .map((e) => e.sourceText);
}

// ========== MÉTHODE PRINCIPALE ==========
exports.chatbotMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const matricule = req.user.Matricule;

    if (!userSessions.has(matricule)) {
      userSessions.set(matricule, {
        plats: [],
        vol: null,
        step: "init",
        lastActivity: Date.now(),
      });
    }

    const session = userSessions.get(matricule);
    session.lastActivity = Date.now();

    const response = await manager.process("fr", message);
    let reply =
      response.answer || "Je n'ai pas compris. Pouvez-vous reformuler ?";

    switch (session.step) {
      case "awaitingVol": {
        const vol = await extractFlightNumber(message);
        if (vol) {
          session.vol = vol;
          session.step =
            response.intent === "Commande.Meal"
              ? "selectingMeals"
              : "selectingMenu";
          reply =
            response.intent === "Commande.Meal"
              ? "Merci. Maintenant, quels plats souhaitez-vous commander ? (3 plats requis)"
              : "Quel menu souhaitez-vous commander ?";
        } else {
          reply = "Numéro de vol invalide. Format attendu : Vol AB123";
        }
        break;
      }

      default:
        switch (response.intent) {
          case "greeting":
            reply = "Bonjour ! Comment puis-je vous aider aujourd'hui ?";
            break;

          case "Recommandation": {
            const recommandations = await Recommandation.HistoriqueEtCarnet(
              matricule
            );
            reply =
              recommandations.length > 0
                ? `Voici mes suggestions : ${recommandations
                    .slice(0, 3)
                    .map((r) => r.nom)
                    .join(", ")}`
                : `Je recommande notre menu du jour : ${
                    (await Menu.getMenuJour()).nom
                  }`;
            break;
          }

          case "Commande.Meal": {
            if (!session.vol) {
              session.step = "awaitingVol";
              reply = "D'abord, quel est votre numéro de vol ? (ex: Vol AB123)";
              break;
            }

            const plats = await extractMeals(message);
            if (plats.length === 3) {
              try {
                await commande.RequestCommandeMeal(
                  session.vol,
                  plats[0],
                  plats[1],
                  plats[2],
                  null,
                  null,
                  matricule
                );
                reply = `Commande enregistrée pour le vol ${
                  session.vol
                } : ${plats.join(", ")}`;
                userSessions.delete(matricule);
              } catch (error) {
                reply = `Erreur : ${error.message}`;
              }
            } else {
              reply =
                "Veuillez sélectionner exactement 3 plats (Entrée, Plat principal, Dessert)";
            }
            break;
          }

          case "Commande.Menu": {
            if (!session.vol) {
              session.step = "awaitingVol";
              reply = "D'abord, quel est votre numéro de vol ? (ex: Vol AB123)";
              break;
            }

            const menu = response.entities.find(
              (e) => e.entity === "menu"
            )?.sourceText;
            if (menu) {
              try {
                await commande.RequestCommandeMenu(
                  session.vol,
                  menu,
                  matricule
                );
                reply = `Menu "${menu}" commandé pour le vol ${session.vol} !`;
                userSessions.delete(matricule);
              } catch (error) {
                reply = `Erreur : ${error.message}`;
              }
            } else {
              reply = "Quel menu souhaitez-vous commander ?";
            }
            break;
          }

          case "Menu": {
            const menus = await Menu.getAllMenu();
            reply = `Menus disponibles : ${menus.map((m) => m.nom).join(", ")}`;
            break;
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
