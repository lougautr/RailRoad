const mongoose = require('mongoose');
const Joi = require('joi');

const trainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  start_station: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true,
  },
  end_station: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true,
  },
  time_of_departure: {
    type: Date,
    required: true,
  },
});

const Train = mongoose.model('Train', trainSchema);

// Fonction de validation utilisant Joi
Train.validateTrain = async function(trainData) {
  const schema = Joi.object({
    name: Joi.string().required(),
    start_station: Joi.string().required(),
    end_station: Joi.string().required(),
    time_of_departure: Joi.date().required(),
  });

  return await schema.validateAsync(trainData);
};

module.exports = Train;
