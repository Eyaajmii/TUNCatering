const express=require('express');
const router=express.Router();
const authcontroller=require("../controllers/authController");
const { authenticateToken } = require("../middlware/auth");

router.post("/register", async (req, res) => {
  try {
    const{username, password, email, nom, prenom, telephone, role,Matricule,roleTunisair,TypePersonnel}=req.body;
    const newuser = await authcontroller.register(
      username,
      password,
      email,
      nom,
      prenom,
      telephone,
      role,
      Matricule,
      roleTunisair,
      TypePersonnel
    );
    res.status(200).json(newuser);
  } catch (err) {
    res.status(400).send(err.message);
  }
});
router.post("/authentification", async(req, res)=>{
    try {
        const { username, password } = req.body;
        const user = await authcontroller.login(username,password);
        res.status(200).json(user);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
});
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la déconnexion", error: err.message });
  }
});
router.put('/update', authenticateToken,async (req, res) => {
    try {
        const updatedUser = await authcontroller.updateUserInfo(req.user._id, req.body);
        res.status(200).json({ message: "Informations mises à jour avec succès", user: updatedUser });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
router.get("/AllUser", authenticateToken,async(req,res)=>{
  try {
    const user=await authcontroller.consulterUser();
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.delete('/supprimer/:id',authenticateToken,async(req,res)=>{
  try {
    const userSupprimer = await authcontroller.supprimerUser(req.params.id);
    res.status(200).json({message: "Utilisateur supprimé avec succès",user: userSupprimer,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
})
module.exports = router; 