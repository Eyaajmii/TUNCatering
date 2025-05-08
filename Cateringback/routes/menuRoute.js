const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");
const Meal=require("../models/Meal");
const Menu = require("../models/Menu");
const {authenticateToken}=require("../middlware/auth")
router.post("/add", authenticateToken, async (req, res) => {
  try {
    const {
      nom,
      PlatsPrincipaux,
      PlatsEntree,
      PlatsDessert,
      Boissons,
      Disponible,
    } = req.body;
    const personnelTunisieCatering = req.user.username;
    if (
      PlatsPrincipaux.length !== 1 ||
      PlatsEntree.length !== 1 ||
      PlatsDessert.length !== 1 ||
      Boissons.length !== 1
    ) {
      return res.status(400).json({
        message:
          "Chaque type de plat (entrée, principal, dessert) doit contenir exactement un plat.",
      });
    }

    const nouveauMenu = await menuController.createMenu(
      nom,
      PlatsPrincipaux,
      PlatsEntree,
      PlatsDessert,
      Boissons,
      Disponible,
      personnelTunisieCatering
    );
    res.status(200).json(nouveauMenu);
  } catch (error) {
    console.error(error);
    if (error.message === "Menu déja existe") {
      return res.status(400).json({ message: "Menu déjà existe" });
    }
    res.status(500).json({
      message: "Erreur lors de la création du menu",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const menus = await menuController.getAllMenu();
    res.status(200).json(menus);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des menus", error });
  }
});

router.get("/Menu/:id", async (req, res) => {
  try {
    const menu = await menuController.getMenuDetail(req.params.id);
    if (!menu) {
      return res.status(404).json({ message: "Menu non trouvé" });
    }
    res.status(200).json(menu);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du menu", error });
  }
});
//Get menu detail
router.post("/detailMenu", async (req, res) => {
  try {
    const { nom } = req.body;

    if (!nom || typeof nom !== "string") {
      return res.status(400).json({ message: "Le nom du menu est requis" });
    }
    const menu = await Menu.findOne({nom});
    if (!menu) {
      return res.status(404).json({ message: "Menu non trouvé" });
    }
    const [platsEntree, platsPrincipal, platsDessert, boissons] =
      await Promise.all([
        Meal.find({ _id: { $in: menu.PlatsEntree } }),
        Meal.find({ _id: { $in: menu.PlatsPrincipaux } }),
        Meal.find({ _id: { $in: menu.PlatsDessert } }),
        Meal.find({ _id: { $in: menu.Boissons } }),
      ]);

    const detailMenu = {
      _id: menu._id,
      nom: menu.nom,
      Disponible: menu.Disponible,
      PlatsEntree: platsEntree,
      PlatsPrincipaux: platsPrincipal,
      PlatsDessert: platsDessert,
      Boissons: boissons,
    };

    res.status(200).json(detailMenu);
  } catch (err) {
    console.error("Erreur lors de la récupération du détail du menu:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

router.put("/updateMenu/:id", async (req, res) => {
  try {
    const menuupdate = await menuController.updateMenu(req.params.id, req.body);
    if (!menuupdate) {
      return res.status(404).json({ message: "Menu non trouvé" });
    }
    res.status(200).json(menuupdate);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du menu", error });
  }
});

router.get("/type/:typeMenu", async (req, res) => {
  try {
    const menus = await menuController.getMenuBytype(req.params.typeMenu);
    res.status(200).json(menus);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Erreur lors de la récupération des menus par type",
        error,
      });
  }
});
router.delete("/:id",async(req,res)=>{
    try{
        await menuController.cancelMenu(req.params.id);
        res.status(200).json({message:"Menu supprimé avec succès"})
    }catch(error){
        res.status(500).json({message:"Erreur lors de la suppression du menu",error});
    }
})

module.exports = router;
