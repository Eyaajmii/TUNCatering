const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");

router.post("/add", async (req, res) => {
  try {
    const { nom, PlatsPrincipaux, PlatsEntree, PlatsDessert, Disponible } =req.body;
     if (
       PlatsPrincipaux.length !== 1 ||
       PlatsEntree.length !== 1 ||
       PlatsDessert.length !== 1
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
      Disponible
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
