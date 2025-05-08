const express=require('express');
const router=express.Router();
const authcontroller=require("../controllers/authController");
const { authenticateToken } = require("../middlware/auth");

router.post("/register", async (req, res) => {
  try {
    const{username, password, email, nom, prenom, telephone, role,Matricule,TypePersonnel}=req.body;
    const newuser = await authcontroller.register(
      username,
      password,
      email,
      nom,
      prenom,
      telephone,
      role,
      Matricule,
      TypePersonnel
    );
    res.status(200).json(newuser);
  } catch (err) {
    res.status(400).send(err.message);
  }
});
router.post("/authentification", async(req, res)=>{
    try {
        const { username, Matricule, password } = req.body;
        const user = await authcontroller.login(username, Matricule, password);
        res.status(200).json(user);
    } catch (err) {
      res.status(400).send(err.message);
    }
});
router.post("/logout", (req, res) => {
  authcontroller.logout(req, res);
});
router.put('/update/:userId', async (req, res) => {
    const newUserInfo = req.body;
    try {
        const updatedUser = await authcontroller.updateUserInfo(req.params.userId, newUserInfo);
        res.status(200).json({ message: "Informations mises à jour avec succès", user: updatedUser });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
module.exports = router;