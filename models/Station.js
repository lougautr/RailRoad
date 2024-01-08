const mongoose = require('mongoose');
const Joi = require('joi');

const stationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  open_hour: {
    type: String, 
    required: true,
  },
  close_hour: {
    type: String,
    required: true,
  },
  image: {
    type: String, // chemin d'accès de l'image
  },
});

const Station = mongoose.model('Station', stationSchema);

// Fonction de validation utilisant Joi
Station.validateStation = async function(stationData) {
  const schema = Joi.object({
    name: Joi.string().required(),
    open_hour: Joi.string().required(),
    close_hour: Joi.string().required(),
  });

  return await schema.validateAsync(stationData);
};

module.exports = Station;