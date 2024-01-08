const request = require('supertest');
const app = require('../app.js'); // Votre application Express
const expect = require('chai').expect;
const User = require('../models/User.js'); // Importez votre modèle d'utilisateur

describe('Endpoints liés aux utilisateurs', () => {
  let authToken;
  let createdUserId;

  it('Devrait créer un nouvel utilisateur et obtenir le token', async () => {
    const response = await request(app)
      .post('/users')
      .send({ email: 'test@example.com', pseudo: 'testuser', password: 'password123', role: 'user' })
      .expect(201);

    expect(response.body).to.have.property('token');

    // Obtient le token de l'utilisateur créé
    authToken = response.body.token;

    // Recherche de l'utilisateur nouvellement créé pour obtenir son ID
    const newUser = await User.findOne({ email: 'test@example.com' });
    if (newUser) {
      createdUserId = newUser._id;
    }
  });

  it('Devrait obtenir les informations d\'un utilisateur existant', async () => {
    const response = await request(app)
      .get(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // Vérifie si la réponse contient les informations attendues de l'utilisateur
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('email', 'test@example.com');
    expect(response.body).to.have.property('pseudo', 'testuser');
  });

  it('Devrait mettre à jour les informations d\'un utilisateur existant', async () => {
    const updatedUserData = { email: 'newemail@example.com', pseudo: 'updateduser' };
    const response = await request(app)
      .put(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedUserData)
      .expect(200);

    // Vérifie si la mise à jour a été effectuée avec succès
    expect(response.body).to.have.property('message', 'User updated successfully');

    // Vérifie si les informations ont été mises à jour
    const updatedUser = await User.findById(createdUserId);
    expect(updatedUser).to.exist;
    expect(updatedUser).to.have.property('email', 'newemail@example.com');
    expect(updatedUser).to.have.property('pseudo', 'updateduser');
  });

  it('Devrait supprimer un utilisateur existant', async () => {
    await request(app)
      .delete(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // Vérifie si l'utilisateur a été effectivement supprimé de la base de données
    const deletedUser = await User.findById(createdUserId);
    expect(deletedUser).to.not.exist;
  });
});
