const request = require('supertest');
const app = require('../app.js'); // Votre application Express
const expect = require('chai').expect;
const User = require('../models/User.js'); // Importez votre modèle d'utilisateur
const Station = require('../models/Station.js'); // Importez votre modèle de station

describe('Endpoints liés aux stations', () => {
  let adminToken;
  let createdStationId;

  after(async () => {
    // Supprimer l'utilisateur admin créé pour les tests
    await User.deleteOne({ email: 'admin@example.com' });
  });

  it('Devrait créer une nouvelle station', async () => {
    const responseUser = await request(app)
        .post('/users')
        .send({ email: 'admin@example.com', pseudo: 'adminuser', password: 'admin123', role: 'admin' })
    adminToken = responseUser.body.token;
    const response = await request(app)
      .post('/stations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'New Station', open_hour: '09:00', close_hour: '18:00' })
      .expect(201);

    // Récupère l'ID de la station créée dans la réponse
    createdStationId = response.body._id;

    expect(response.body).to.have.property('_id');
    expect(response.body).to.have.property('name', 'New Station');
  });

  it('Devrait obtenir les informations d\'une station existante', async () => {
    const response = await request(app)
      .get(`/stations/${createdStationId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('name');
    expect(response.body).to.have.property('open_hour');
    expect(response.body).to.have.property('close_hour');
  });

  it('Devrait mettre à jour les informations d\'une station existante', async () => {
    const updatedData = { name: 'Updated Station', open_hour: '10:00', close_hour: '19:00' };
    const response = await request(app)
      .put(`/stations/${createdStationId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updatedData)
      .expect(200);

    expect(response.body).to.have.property('name', 'Updated Station');
  });

  it('Devrait supprimer une station existante', async () => {
    await request(app)
      .delete(`/stations/${createdStationId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const deletedStation = await Station.findById(createdStationId);
    expect(deletedStation).to.not.exist;
  });
});
