const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Train = require('../models/Train');

// Réserver un billet
const bookTicket = async (req, res) => {
  try {
    const { userEmail, trainName } = req.body;
    // Recherche de l'utilisateur par son email
    const userObject = await User.findOne({ email: userEmail });
    if (!userObject) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Recherche du train par son ID
    const trainObject = await Train.findOne({name: trainName});
    if (!trainObject) {
      return res.status(404).json({ error: 'Train not found' });
    }

    // Création d'un nouveau ticket
    const newTicket = new Ticket({
      user: userObject,
      train: trainObject,
      is_valid: false,
    });

    await newTicket.save();

    res.status(201).json(newTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Valider un ticket
const validateTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    // Vérification si le ticket existe
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Vérification si l'utilisateur connecté peut valider ce ticket (admin ou employye)
    if (req.user.role !== 'admin' && String(ticket.user) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Vérification si le ticket est déjà valide
    if (ticket.is_valid) {
      return res.status(400).json({ error: 'Ticket already validated' });
    }

    // Validation du ticket
    ticket.is_valid = true;
    await ticket.save();

    res.json({ message: 'Ticket validated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  bookTicket,
  validateTicket,
};