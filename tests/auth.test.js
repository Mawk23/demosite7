const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcrypt');

// increase jest timeout as downloading mongod binary may take time on some systems
jest.setTimeout(60000);

const User = require('../models/user.model');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  // create express app and mount routes
  app = express();
  app.use(express.json());
  app.use('/api/auth', require('../routes/auth'));
  app.use('/api/users', require('../routes/users'));

  // seed user
  const hashed = await bcrypt.hash('password123', 12);
  await User.create({ username: 'alice', password: hashed, email: 'alice@example.com' });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

test('POST /api/auth/login returns token and user', async () => {
  const res = await request(app).post('/api/auth/login').send({ username: 'alice', password: 'password123' });
  expect(res.status).toBe(200);
  expect(res.body.token).toBeDefined();
  expect(res.body.user).toBeDefined();
  expect(res.body.user.username).toBe('alice');
});

test('GET /api/users/me with token returns profile', async () => {
  const login = await request(app).post('/api/auth/login').send({ username: 'alice', password: 'password123' });
  const token = login.body.token;
  const res = await request(app).get('/api/users/me').set('Authorization', 'Bearer ' + token);
  expect(res.status).toBe(200);
  expect(res.body.username).toBe('alice');
  expect(res.body.email).toBe('alice@example.com');
});
