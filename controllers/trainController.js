const Train = require('../models/Train');
const Station = require('../models/Station');

// Lister tous les trains
const listTrains = async (req, res) => {
  try {
    const { sortBy, limit } = req.query;
    const query = Train.find();

    // Possibilité de trier les trains
    if (sortBy) {
      query.sort(sortBy);
    }

    // Limite de 10 trains
    if (limit) {
      query.limit(parseInt(limit, 10));
    }

    const trains = await query.exec();
    res.json(trains);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Obtenir les informations d'un train
const getTrainInfo = async (req, res) => {
  try {
    // Obtenir les informations du train et les informations des stations de départ et d'arrivée
    const train = await Train.findById(req.params.trainId).populate('start_station end_station');

    // Vérification si le train existe
    if (!train) {
      return res.status(404).json({ error: 'Train not found' });
    }

    const trainInfo = {
      id: train._id,
      name: train.name,
      start_station: train.start_station,
      end_station: train.end_station,
      time_of_departure: train.time_of_departure,
    };

    res.json(trainInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Créer un train
const createTrain = async (req, res) => {
  try {
    // Seul les admin peuvent créer un train
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, start_station, end_station, time_of_departure } = req.body;

    // Vérification si les stations existent par leur nom
    const startStation = await Station.findOne({ name: start_station });
    const endStation = await Station.findOne({ name: end_station });

    if (!startStation || !endStation) {
      return res.status(404).json({ error: 'Start or end station not found' });
    }

    const newTrain = new Train({
      name,
      start_station: startStation._id,
      end_station: endStation._id,
      time_of_departure,
    });

    await newTrain.save();
    res.status(201).json(newTrain);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Modifier un train
const updateTrain = async (req, res) => {
  try {
    // Seul les admin peuvent modifier un train
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, start_station, end_station, time_of_departure } = req.body;

    // Vérifier si les stations existent
    const startStationExists = await Station.exists({  _id: start_station  });
    const endStationExists = await Station.exists({ _id: end_station });

    if (!startStationExists || !endStationExists) {
      return res.status(404).json({ error: 'Start or end station not found' });
    }

    const updatedTrain = await Train.findByIdAndUpdate(
      req.params.trainId,
      { name, start_station, end_station, time_of_departure },
      { new: true }
    );

    // Vérification si le train existe
    if (!updatedTrain) {
      return res.status(404).json({ error: 'Train not found' });
    }

    res.json(updatedTrain);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Supprimer un train
const deleteTrain = async (req, res) => {
  try {
    // Seul les admin peuvent supprimer un train
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const deletedTrain = await Train.findOneAndDelete(req.params.trainId);

    // Vérification si le train existe
    if (!deletedTrain) {
      return res.status(404).json({ error: 'Train not found' });
    }

    res.json({ message: 'Train deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  listTrains,
  getTrainInfo,
  createTrain,
  updateTrain,
  deleteTrain,
};
