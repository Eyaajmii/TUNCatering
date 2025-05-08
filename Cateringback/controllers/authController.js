const bcrypt=require("bcrypt");
const user=require("../models/User");
const pn=require("../models/personnelnavigant");
const pnTunisieCatering=require("../models/AdminTunCatering");
const pnDirectionCatering=require("../models/PersonnelTunDirCatering");
const pnDirectionPersonnel=require("../models/personnelDirPersonnel");
const admin=require("../models/adminModel")
const{generateAccesToken}=require("../middlware/auth");

class AuthController {
  static async register(
    username,
    password,
    email,
    nom,
    prenom,
    telephone,
    role,
    Matricule,
    TypePersonnel
  ) {
    try {
      const existUser = await user.findOne({ username });
      if (existUser) {
        throw new Error("Utilisateur déja existe");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newuser = await user.create({
        username,
        password: hashedPassword,
        email,
        nom,
        prenom,
        telephone,
        role,
      });
      if (role == "Personnel navigant") {
        await pn.create({
          userId: newuser._id,
          Matricule,
          TypePersonnel,
        });
      } else if (role == "Personnel Tunisie Catering") {
        await pnTunisieCatering.create({
          userId: newuser._id,
        });
      } else if (role == "Personnel de Direction du Catering Tunisiar") {
        await pnDirectionCatering.create({
          userId: newuser._id,
          Matricule,
        });
      } else if (role == "Personnel de Direction du Personnel Tunisiar") {
        await pnDirectionPersonnel.create({
          userId: newuser._id,
          Matricule,
        });
      } else if (role == "Administrateur") {
        await admin.create({
          userId: newuser._id,
        });
      }
      return newuser;
    } catch (err) {
      throw new Error(err.message);
    }
  }
  static async login(username, Matricule, password) {
    try {
      const Finduser = await user.findOne({ username });
      if (!Finduser) {
        throw new Error("Utilisateur non trouvé");
      }
      const isValidPassword = await bcrypt.compare(password, Finduser.password);
      if (!isValidPassword) {
        throw new Error("Mot de passe incorrect");
      }
      let TypePersonnel = null;
      if (Finduser.role === "Personnel navigant") {
        const pnData = await pn.findOne({ Matricule });
        if (pnData) TypePersonnel = pnData.TypePersonnel;
      }
      const token = generateAccesToken(
        Finduser.username,
        Matricule || null,
        Finduser.role,
        TypePersonnel
      );
      return { token };
    } catch (err) {
      throw new Error(err);
    }
  }
  static logout(req, res) {
    try {
      res.clearCookie("auth-token");
      res.status(200).json({ message: "Déconnexion réussie" });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Erreur lors de la déconnexion", error: err.message });
    }
  }
  static async updateUserInfo(id, data) {
    try {
      const updateData = {};

      if (data.nom) updateData.nom = newUserInfo.nom;
      if (data.prenom) updateData.prenom = newUserInfo.prenom;
      if (data.email) updateData.email = newUserInfo.email;
      if (data.telephone) updateData.telephone = newUserInfo.telephone;
      if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        updateData.password = hashedPassword;
      }
      const updatedUser = await user.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      return updatedUser;
    } catch (err) {
      throw new Error(err.message);
    }
  }
}
module.exports = AuthController;