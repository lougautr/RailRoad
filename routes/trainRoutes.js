const express = require('express');
const router = express.Router();
const trainController = require('../controllers/trainController');
const { authenticateJWT } = require('../middlewares/authenticationMiddleware');

// Route pour lister les trains
router.get('/trains', trainController.listTrains);

// Route pour obtenir des informations sur un train
router.get('/trains/:trainId', trainController.getTrainInfo);

// Route pour créer un nouveau train (protégée par JWT)
router.post('/trains', authenticateJWT, trainController.createTrain);

// Route pour mettre à jour un train (protégée par JWT)
router.put('/trains/:trainId', authenticateJWT, trainController.updateTrain);

// Route pour supprimer un train (protégée par JWT)
router.delete('/trains/:trainId', authenticateJWT, trainController.deleteTrain);

module.exports = router;
