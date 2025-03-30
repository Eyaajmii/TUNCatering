const { NlpManager } = require("node-nlp");
const Recommandation = require("../controllers/RecommandationController");
const Menu = require("../controllers/menuController");
const Meal = require("../controllers/mealController");
const commande = require("../controllers/commandeController");

const manager = new NlpManager({ languages: ["fr"], forceNER: true });

(async () => {
  await manager.load("model.nlp");
  console.log("Chatbot model loaded successfully!");
})();

// Temporary session storage
const userSessions = {}; // Example: userSessions["uuid"] = { plats: [], vol: "", matricule: "", step: null }

async function extractMeals(message) {
  const mealExtract = message
    .toLowerCase()
    .split(/[\s,;.]+/)
    .filter(Boolean);
  const meals = await Meal.getAllMeals();
  const mealsFound = [];

  for (const m of meals) {
    const name = m.nom.toLowerCase();
    manager.addNamedEntityText("meal", name, ["fr"], [name]);
    if (mealExtract.some((e) => name.includes(e))) {
      mealsFound.push(m.nom);
    }
  }
  return [...new Set(mealsFound)];
}

exports.chatbotMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    console.log(`Received message: ${message} from session: ${sessionId}`);
    const response = await manager.process("fr", message);
    const intent = response.intent;

    if (!userSessions[sessionId]) {
      userSessions[sessionId] = {
        plats: [],
        vol: "",
        matricule: "",
        step: null,
      };
    }

    const session = userSessions[sessionId];
    let reply = "Je n'ai pas compris. Pouvez-vous reformuler?";

    switch (intent) {
      case "greeting":
        reply =
          response.answer || "Bonjour, comment puis-je vous aider aujourd'hui?";
        break;

      case "Recommandation":
        const recommandations = await Recommandation.getMenuJour();
        reply =
          "Voici le menu du jour recommandé : " +
          recommandations.map((m) => m.nom).join(", ");
        break;

      case "Commande.Meal":
        if (session.step === "awaitingVol") {
          session.vol = message;
          session.step = "awaitingMatricule";
          reply = "Merci. Quel est votre matricule ?";
        } else if (session.step === "awaitingMatricule") {
          session.matricule = message;
          try {
            await commande.RequestCommandeMeal({
              numeroVol: session.vol,
              matriculePNC: session.matricule,
              plats: session.plats,
            });
            reply = `Votre commande a été enregistrée pour le vol ${session.vol}. Merci !`;
            delete userSessions[sessionId];
          } catch (error) {
            console.error("Erreur commande:", error.message);
            reply =
              "Une erreur s'est produite lors de l'enregistrement de la commande.";
          }
        } else {
          const plats = await extractMeals(message);
          if (plats.length === 0) {
            reply =
              "Aucun plat trouvé. Pouvez-vous reformuler les noms des plats ?";
          } else if (plats.length < 3) {
            reply = `J'ai trouvé ${plats.length} plat(s) : ${plats.join(
              ", "
            )}. Veuillez choisir exactement trois plats.`;
          } else if (plats.length > 3) {
            reply = `Trop de plats mentionnés. Veuillez choisir exactement trois.`;
          } else {
            session.plats = plats;
            session.step = "awaitingVol";
            reply = `Parfait, vous avez choisi : ${plats.join(
              ", "
            )}. Quel est votre numéro de vol ?`;
          }
        }
        break;

      case "Menu":
        const menus = await Menu.getAllMenu();
        reply =
          "Voici les menus disponibles : " + menus.map((m) => m.nom).join(", ");
        break;

      case "Meal":
        const allMeals = await Meal.getAllMeals();
        reply =
          "Voici les plats disponibles : " +
          allMeals.map((m) => m.nom).join(", ");
        break;

      default:
        if (response.answer) {
          reply = response.answer;
        }
    }

    console.log(`Chatbot reply: ${reply}`);
    res.json({ reply });
  } catch (err) {
    console.error("Error in chatbotMessage:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
async function updateMealEntities() {
  const meals = await Meal.getAllMeals(); // Fetch meals from DB
  for (const meal of meals) {
    manager.addNamedEntityText(
      "meal",
      meal.nom.toLowerCase(),
      ["fr"],
      [meal.nom.toLowerCase()]
    );
  }
  await manager.train();
  manager.save();
}
updateMealEntities();
