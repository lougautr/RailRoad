const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticateJWT } = require('../middlewares/authenticationMiddleware');

// Route pour réserver un nouveau ticket
router.post('/tickets', ticketController.bookTicket);

// Route pour valider un ticket (protégée par JWT et réservée aux employee ou admin)
router.post('/tickets/:ticketId/validate', authenticateJWT, ticketController.validateTicket);

module.exports = router;
