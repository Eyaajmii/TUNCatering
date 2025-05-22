const BonLivraison = require("../models/bonLivraison");
const Vol = require("../models/vol");
const Commande = require("../models/Commande");
const user = require("../models/User");
const personnelTunisair = require("../models/PersonnelTunisairModel");
const PersonnelNavigant = require("../models/personnelnavigant");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

async function generateBonLivraisonPDF(bonLivraison) {
  return new Promise(async (resolve, reject) => {
    try {
      const pdfDir = path.join(__dirname, "..", "public", "pdfs");
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      const fileName = `bon_livraison_${bonLivraison.numeroBon}.pdf`;
      const filePath = path.join(pdfDir, fileName);
      const pdfPath = `/pdfs/${fileName}`;

      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // PDF Content
      doc.fontSize(20).text("Bon de Livraison", { align: "center" });
      doc.moveDown();
      doc.fontSize(14).text(`Numéro: ${bonLivraison.numeroBon}`);
      doc.text(`Vol: ${bonLivraison.vol}`);
      doc.moveDown();

      // Add more content as needed
      doc.fontSize(12).text("Détails des commandes:", { underline: true });
      doc.moveDown(0.5);
      const bonWithCommandes = await BonLivraison.findById(
        bonLivraison._id
      ).populate("commandes");

      bonWithCommandes.commandes.forEach((commande, index) => {
        doc.text(`${index + 1}. Commande ${commande._id}`);
      });
      if (bonLivraison.qrCodeImage) {
        const qrImageBuffer = Buffer.from(
          bonLivraison.qrCodeImage.split(",")[1],
          "base64"
        );
        doc.addPage();
        doc.fontSize(16).text("QR Code associé :", { align: "center" });
        doc.image(qrImageBuffer, {
          fit: [200, 200],
          align: "center",
          valign: "center",
        });
      }

      doc.end();

      stream.on("finish", () => resolve(pdfPath));
      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
}

exports.createBonLivraison = async (req, res) => {
  try {
    console.log("Requête reçue :", req.body);

    const { numeroBon, volId, commandes, conformite } = req.body;

    if (!numeroBon || !volId || !commandes || commandes.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Données manquantes ou invalides" });
    }

    const vol = await Vol.findOne({ numVol: volId });
    if (!vol) {
      return res.status(404).json({
        success: false,
        message: `Aucun vol trouvé avec le numéro ${volId}`,
      });
    }
    const existingBonLivraison = await BonLivraison.findOne({
      vol: volId,
      Statut: { $ne: "Annulé" },
    });
    if (existingBonLivraison) {
      return res.status(400).json({
        success: false,
        message: "Un bon de livraison actif existe déjà pour ce vol",
      });
    }
    const commandesValides = await Promise.all(
      commandes.map((commandeId) => Commande.findById(commandeId))
    );

    if (commandesValides.some((c) => !c)) {
      return res.status(404).json({
        success: false,
        message: "Une ou plusieurs commandes sont introuvables",
      });
    }
    const hasEnAttenteOuRetard = commandesValides.some(
      (c) => c.Statut === "en attente" || c.Statut === "en retard"
    );
    if (hasEnAttenteOuRetard) {
      return res.status(400).json({
        success: false,
        message:
          "Impossible de créer le bon de livraison : au moins une commande est en statut 'En attente' ou 'En retard'",
      });
    }
    const commandesFiltrees = commandesValides
      .filter((c) => c.Statut !== "annulé")
      .map((c) => c._id);
    const cmds = commandesFiltrees.map((id) => ({
        commande: id,
    }));
    const newBonLivraison = new BonLivraison({
      numeroBon,
      vol: volId.toString(),
      commandes: cmds,
      personnelLivraison: null,
      Statut: "En attente",
      conformite: conformite || "Non vérifié",
    });
    const qrData = `Bon de Livraison: ${numeroBon}`;
    const qrCodeImage = await QRCode.toDataURL(qrData);
    newBonLivraison.qrCodeImage = qrCodeImage;
    await newBonLivraison.save();

    // Generate PDF after saving
    const pdfPath = await generateBonLivraisonPDF(newBonLivraison);
    newBonLivraison.pdfPath = pdfPath;
    await newBonLivraison.save();

    res.status(201).json({
      success: true,
      message: "Bon de livraison créé avec succès",
      data: newBonLivraison,
    });
  } catch (error) {
    console.error("Erreur lors de la création du bon de livraison :", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

exports.getBonByVolId = async (req, res) => {
  try {
    const { volId } = req.params;
    const bonLivraison = await BonLivraison.findOne({ vol: volId }).populate(
      "commandes personnelLivraison"
    );

    if (!bonLivraison) {
      return res.status(404).json({
        success: false,
        message: "Aucun bon de livraison trouvé pour ce vol",
      });
    }
    const vol = await Vol.findOne({ numVol: volId });

    res.status(200).json({
      success: true,
      data: {
        ...bonLivraison.toObject(),
        volInfo: vol,
      },
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

exports.getBonLivraisonById = async (req, res) => {
  try {
    const { id } = req.params;
    const bonLivraison = await BonLivraison.findById(id).populate(
      "vol commandes personnelLivraison"
    );

    if (!bonLivraison) {
      return res
        .status(404)
        .json({ success: false, message: "Bon de livraison introuvable." });
    }

    res.status(200).json( bonLivraison );
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du bon de livraison :",
      error
    );
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
exports.scanBonLivraison = async (req, res) => {
  try {
    const { id } = req.params;
    const { qrData } = req.body; 

    const bonLivraison = await BonLivraison.findById(id);

    if (!bonLivraison) {
      return res
        .status(404)
        .json({ success: false, message: "Bon non trouvé" });
    }

    // Vérification du QR code
    const expectedQR = `Bon de Livraison: ${bonLivraison.numeroBon}`;
    if (qrData !== expectedQR) {
      return res
        .status(400)
        .json({ success: false, message: "QR Code invalide" });
    }

    bonLivraison.Statut = "Validé";
    bonLivraison.conformite = "Confirmé";
    bonLivraison.personnelLivraison = req.user.Matricule;
    bonLivraison.dateLivraison = new Date();
    await bonLivraison.save();

    res.status(200).json({ success: true, data: bonLivraison });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.updateStatutBonLivraison = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmerConformite, commandesConfirmées } = req.body;
    const username = req.user.username;
    const User = await user.findOne({ username });
    const pn = await personnelTunisair.findOne({ userId: User._id });
    if (!pn) return res.status(404).json({ message: "Matricule non trouvé" });
    const personnelLivraison = pn.Matricule;
    const bn = await BonLivraison.findById(id).populate("commandes.commande");
    if (!bn)return res.status(404).json({ message: "Bon de livraison introuvable" });
    let conformite = bn.conformite;
    let statut = bn.Statut;
    //confirmation manuelle des commandes
    if (Array.isArray(commandesConfirmées) && commandesConfirmées.length > 0) {
      bn.commandes.forEach((cmd) => {
        if (commandesConfirmées.includes(String(cmd.commande._id))) {
          cmd.confirme = true;
        }
      });
    }
    //confirmation globale => toutes les commandes confirmées
    if (confirmerConformite === true) {
      bn.commandes.forEach((cmd) => {
        cmd.confirme = true;
      });
      conformite = "Confirmé";
      statut = "Validé";
    } else {
      // vérifie si toutes les commandes sont confirmées
      const toutesConfirmées = bn.commandes.every(
        (cmd) => cmd.confirme === true
      );
      if (toutesConfirmées) {
        conformite = "Confirmé";
        statut = "Validé";
      }
    }
    
    bn.conformite = conformite;
    bn.Statut = statut;
    bn.personnelLivraison = personnelLivraison;
    await bn.save();
    if (statut === "Validé") {
      for (const c of bn.commandes) {
        if (c.commande && c.commande._id) {
          await Commande.findByIdAndUpdate(c.commande._id, { Statut: "livré" });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Statut et conformité mis à jour",
      data: bn,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

//par tunisie catering
exports.updateBonLivraison=async(req,res)=>{
  try{
    const{id}=req.params;
    const bn=await BonLivraison.findById(id);
    if(!bn){
      return res.status(404).json({ success: false, message: "Bon de livraison non trouvé" })
    }
     if (bn.Statut !== "En attente") {
      return res.status(400).json({ success: false, message: "Le bon de livraison ne peut être modifié que s'il est en attente" });
    }
    await BonLivraison.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, message: "Bon de livraison mis à jour avec succès" });
  }catch(err){
    res.status(500).json({ success: false, message: "Erreur" });
  }
};
exports.getAllBonsLivraisons = async (req, res) => {
  try {
    const bnlivs = await BonLivraison.find();
    res.status(200).json({
      success: true,
      message: "Statut mis à jour",
      data: bnlivs,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
exports.AnnulerBn=async(req,res)=>{
  try {
    const { id } = req.params;
    const bn = await BonLivraison.findById(id);
    if (!bn) {
      return res
        .status(404)
        .json({ success: false, message: "Bon de livraison non trouvé" });
    }
    if (bn.Statut !== "En attente") {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Le bon de livraison ne peut être annulé que s'il est en attente",
        });
    }
    bn.Statut = "Annulé";
    bn.conformite = "Non confirmé";
    await bn.save();
  } catch (err) {
    if (err.message === "bon livraison not found") {
      return res.status(404).send("Facture introuvable.");
    }
    if (
      err.message === "Seules les bons de livraison en attente peuvent être annulées"
    ) {
      return res.status(400).send(err.message);
    }
    console.error("Erreur interne:", err);
    res.status(500).send("Erreur interne du serveur.");
  }
}
exports.getBonsNonFacture=async(req,res)=>{
  try{
    const bns = await BonLivraison.find({ Facturé:false});
    if (!bns) {
      return res
        .status(404)
        .json({ success: false, message: "Aucun Bon de livraison trouvé" });
    }
    res.status(200).json(bns);
  }catch (err) {
     res.status(500)
  }
}