const request = require('supertest');
const app = require('../app'); // Votre application Express
const expect = require('chai').expect;
const User = require('../models/User'); // Importez votre modèle d'utilisateur
const Train = require('../models/Train'); // Importez votre modèle de train
const Ticket = require('../models/Ticket'); // Importez votre modèle de ticket
const Station = require('../models/Station');

describe('Test de création de ticket', () => {
  let adminToken;
  let createdTrainId;
  let createdUserId;

  after(async () => {
    // Nettoyage des données de test après les tests
    await User.deleteOne({ email: 'admin@example.com' });
    await User.deleteOne({ email: 'user@example.com' });
    await Train.deleteOne({ _id: createdTrainId });
    await Station.deleteMany({ name: { $in: ['First Station', 'Second Station'] } });
  });

  it('Devrait créer un nouveau ticket pour un utilisateur existant et un train existant', async () => {
    // Création d'un utilisateur admin pour les tests
    const adminResponse = await request(app)
      .post('/users')
      .send({
        email: 'admin@example.com',
        pseudo: 'adminuser',
        password: 'admin123',
        role: 'admin',
      });
    adminToken = adminResponse.body.token;

    // Création d'un utilisateur pour les tests
    let user = {
        email: 'user@example.com',
        pseudo: 'testuser',
        password: 'test123',
        role: 'user',
      }

    const userResponse = await request(app)
      .post('/users')
      .send(user);

    const userFound = await User.findOne({ email: user.email });
    createdUserId = userFound._id;
    const firstStationResponse = await request(app)
      .post('/stations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'First Station', open_hour: '09:00', close_hour: '18:00' })

    const secondStationResponse = await request(app)
      .post('/stations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Second Station', open_hour: '09:00', close_hour: '18:00' })

    firstStationId = firstStationResponse.body.name;
    secondStationId = secondStationResponse.body.name;

    // Création d'un train pour les tests
    const trainResponse = await request(app)
      .post('/trains')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Express Train 1',
        start_station: firstStationId,
        end_station: secondStationId,
        time_of_departure: '2023-12-31T08:00:00Z',
      });

    createdTrainId = trainResponse.body._id;

    const response = await request(app)
      .post('/tickets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userEmail: user.email,
        trainName: trainResponse.body.name
      })
      .expect(201);

    const createdTicket = await Ticket.findById(response.body._id);

    expect(createdTicket).to.not.be.null;
    expect(createdTicket.user.toString()).to.equal(createdUserId.toString());
    expect(createdTicket.train.toString()).to.equal(createdTrainId.toString());
    expect(createdTicket.is_valid).to.be.false;
  });
});
