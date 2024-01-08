const request = require('supertest');
const app = require('../app.js');
const expect = require('chai').expect;
const User = require('../models/User.js');
const Station = require('../models/Station.js');
const Train = require('../models/Train.js');

describe('Endpoints liés aux trains', () => {
  let adminToken;
  let firstStationName;
  let secondStationName;
  let createdTrainId;

  after(async () => {
    await Station.deleteMany({ name: { $in: [firstStationName, secondStationName] } });
    await Train.deleteOne({ _id: createdTrainId });
    await User.deleteOne({ email: 'admin@example.com' });
  });

  it('Devrait créer un nouveau train', async () => {
    const responseUser = await request(app)
      .post('/users')
      .send({ email: 'admin@example.com', pseudo: 'adminuser', password: 'admin123', role: 'admin' });
    adminToken = responseUser.body.token;

    const firstStationResponse = await request(app)
      .post('/stations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'First Station', open_hour: '09:00', close_hour: '18:00' })

    const secondStationResponse = await request(app)
      .post('/stations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Second Station', open_hour: '09:00', close_hour: '18:00' })

    firstStationName = firstStationResponse.body.name;
    secondStationName = secondStationResponse.body.name;
    const trainData = {
      name: 'Express Train',
      start_station: firstStationName,
      end_station: secondStationName,
      time_of_departure: new Date('2023-12-31T08:00:00Z'),
    };

    const response = await request(app)
      .post('/trains')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(trainData)
      .expect(201);

    createdTrainId = response.body._id;

    expect(response.body).to.have.property('_id');
    expect(response.body).to.have.property('name', 'Express Train');
    expect(response.body).to.have.property('start_station', firstStationResponse.body._id);
    expect(response.body).to.have.property('end_station', secondStationResponse.body._id);
    expect(new Date(response.body.time_of_departure)).to.eql(trainData.time_of_departure);
  });

  it('Devrait obtenir les informations d\'un train existant', async () => {
    const response = await request(app)
      .get(`/trains/${createdTrainId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(response.body).to.have.property('id', createdTrainId);
    expect(response.body).to.have.property('name', 'Express Train');
  });

  it('Devrait mettre à jour les informations d\'un train existant', async () => {
    const firstStation = await Station.findOne({ name: firstStationName });
    const secondStation = await Station.findOne({ name: secondStationName });

    const updatedData = {
      name: 'Updated Express Train',
      start_station: firstStation._id,
      end_station: secondStation._id,
      time_of_departure: new Date('2023-12-31T10:00:00Z'),
    };
  
    const response = await request(app)
      .put(`/trains/${createdTrainId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updatedData)
      .expect(200);
  
    expect(response.body).to.have.property('name', 'Updated Express Train');
    expect(response.body).to.have.property('start_station', firstStation.id);
    expect(response.body).to.have.property('end_station', secondStation.id);
    expect(new Date(response.body.time_of_departure)).to.eql(updatedData.time_of_departure);
  });
  

  it('Devrait supprimer un train existant', async () => {
    await request(app)
      .delete(`/trains/${createdTrainId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const deletedTrain = await Train.findById(createdTrainId);
    expect(deletedTrain).to.not.exist;
  });
});
