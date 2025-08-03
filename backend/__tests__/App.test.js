
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

beforeAll(async () => {
  const url = process.env.MONGO_URI || 'mongodb://localhost:27017/test';
  await mongoose.connect(url);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('App Tests', () => {
  test('GET /api/todos/ should return todos', async () => {
    const response = await request(app)
      .get('/api/todos')
      .expect(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /api/todos/ should create a todo', async () => {
    const todo = {
      title: 'Test Todo',
      completed: false
    };

    const response = await request(app)
      .post('/api/todos')
      .send(todo)
      .expect(201);

    expect(response.body.title).toBe(todo.title);
  });
});