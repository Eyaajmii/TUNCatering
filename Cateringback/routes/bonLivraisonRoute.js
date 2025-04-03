// routes/bonLivraison.routes.js
const express = require('express');
const router = express.Router();
const bonLivraisonController = require('../controllers/bonLivraisonController');

router.post('/', bonLivraisonController.creerBonLivraison);
router.get('/:id', bonLivraisonController.getBonLivraison);

module.exports = router;