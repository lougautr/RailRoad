const Station = require('../models/Station');
const Train = require('../models/Train');
const sharp = require('sharp');
const path = require('path');

// Lister toutes les stations
const listStations = async (req, res) => {
  try {
    const { sortBy } = req.query;
    const query = Station.find();

    // Possibilité de trier les stations
    if (sortBy) {
      query.sort(sortBy);
    }

    const stations = await query.exec();
    res.json(stations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Obtenir les informations d'une station
const getStationInfo = async (req, res) => {
  try {
    const station = await Station.findById(req.params.stationId);

    // Vérification si la station existe
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    const stationInfo = {
      id: station._id,
      name: station.name,
      open_hour: station.open_hour,
      close_hour: station.close_hour,
      image: station.image ? path.join('/img', station.image) : null,
    };

    res.json(stationInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Créer une station
const createStation = async (req, res) => {
  try {
    // Seul les admin peuvent créer une station
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, open_hour, close_hour } = req.body;
    const newStation = new Station({ name, open_hour, close_hour });

    // Traitement de l'image
    if (req.body.image) {
      try {
        // Récupèration du nom de base sans l'extension
        const imageName = path.basename(req.body.image, path.extname(req.body.image)); 
        // Chemin de l'image redimensionnée
        const resizedImagePath = path.join(__dirname, '..', 'img', `${imageName}-resized.jpg`);

        // Redimensionnement de l'image
        await sharp(req.body.image)
          .resize(200, 200)
          .toFile(resizedImagePath);

        // Enregistrement du nom de l'image
        newStation.image = `${imageName}-resized.jpg`;
      } catch (imageError) {
        console.error('Error processing image:', imageError);
        return res.status(500).json({ error: 'Error processing image' });
      }
    }

    await newStation.save();
    res.status(201).json(newStation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Modifier une station
const updateStation = async (req, res) => {
  try {
    // Seul les admin peuvent modifier une station
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, open_hour, close_hour, image } = req.body;
    const existingStation = await Station.findById(req.params.stationId);

    // Vérification si la station existe
    if (!existingStation) {
      return res.status(404).json({ error: 'Station not found' });
    }

    // Mise à jour des propriétés de la station
    existingStation.name = name;
    existingStation.open_hour = open_hour;
    existingStation.close_hour = close_hour;

    // Mise à jour de l'image si une nouvelle image est fournie
    if (req.body.image) {
      try {
        const imageName = path.basename(req.body.image, path.extname(req.body.image));
        const resizedImagePath = path.join(__dirname, '..', 'img', `${imageName}-resized.jpg`);

        await sharp(req.body.image)
          .resize(200, 200)
          .toFile(resizedImagePath);

        existingStation.image = `${imageName}-resized.jpg`;
      } catch (imageError) {
        console.error('Error processing image:', imageError);
        return res.status(500).json({ error: 'Error processing image' });
      }
    }

    const updatedStation = await existingStation.save();
    res.json(updatedStation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Supprimer une station
const deleteStation = async (req, res) => {
  try {
    // Seul les admin peuvent supprimer une station
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Supprimer les trains associés à cette station
    await Train.deleteMany({ $or: [{ start_station: req.params.stationId }, { end_station: req.params.stationId }] });

    const deletedStation = await Station.findOneAndDelete({ _id: req.params.stationId });
    
    // Vérification si la station existe
    if (!deletedStation) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json({ message: 'Station deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  listStations,
  getStationInfo,
  createStation,
  updateStation,
  deleteStation,
};
