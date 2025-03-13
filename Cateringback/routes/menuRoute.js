const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");

router.post("/add", async (req, res) => {
  try {
    const {
      nom,
      Rotation,
      typeMenu,
      PlatsPrincipaux,
      PlatsEntree,
      PlatsDessert,
    } = req.body;
    const nouveauMenu = await menuController.createMenu(
      nom,
      Rotation,
      typeMenu,
      PlatsPrincipaux,
      PlatsEntree,
      PlatsDessert
    );
    res.status(200).json(nouveauMenu);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la création du menu", error });
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

router.get("/:id", async (req, res) => {
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
