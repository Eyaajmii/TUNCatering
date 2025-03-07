const express = require("express");
const router = express.Router();
const menuService = require("../services/menuService");

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
    const nouveauMenu = await menuService.createMenu(
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
    const menus = await menuService.getAllMenu();
    res.status(200).json(menus);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des menus", error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const menu = await menuService.getMenuDetail(req.params.id);
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
    const menuupdate = await menuService.updateMenu(req.params.id, req.body);
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
    const menus = await menuService.getMenuBytype(req.params.typeMenu);
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
        await menuService.cancelMenu(req.params.id);
        res.status(200).json({message:"Menu supprimé avec succès"})
    }catch(error){
        res.status(500).json({message:"Erreur lors de la suppression du menu",error});
    }
})

module.exports = router;
