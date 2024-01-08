const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');
const { authenticateJWT } = require('../middlewares/authenticationMiddleware');

// Route pour lister les stations
router.get('/stations', stationController.listStations);

// Route pour obtenir des informations sur une station
router.get('/stations/:stationId', stationController.getStationInfo);

// Route pour créer une nouvelle station (protégée par JWT)
router.post('/stations', authenticateJWT, stationController.createStation);

// Route pour mettre à jour une station (protégée par JWT)
router.put('/stations/:stationId', authenticateJWT, stationController.updateStation);

// Route pour supprimer une station (protégée par JWT)
router.delete('/stations/:stationId', authenticateJWT, stationController.deleteStation);

module.exports = router;
