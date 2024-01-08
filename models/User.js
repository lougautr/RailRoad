const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Joi = require('joi');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  pseudo: {
    type: String,
    unique: true,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'employee'],
    default: 'user'
  }
});

// Ajout du plugin passport-local-mongoose pour gérer le champ "password"
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

const User = mongoose.model('User', userSchema);

// Fonction de validation utilisant Joi
User.validateUser = async function(userData) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    pseudo: Joi.string().required(),
    role: Joi.string().valid('user', 'admin', 'employee').default('user')
  });

  return await schema.validateAsync(userData);
};

module.exports = User;
