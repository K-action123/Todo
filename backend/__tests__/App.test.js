const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Todo = require('../models/Todo');

beforeAll(async () => {
  const url = process.env.MONGO_URI || 'mongodb://localhost:27017/test';
  await mongoose.connect(url);
});

afterAll(async () => {
  await mongoose.connection.close();
});

// Clean up database before each test
beforeEach(async () => {
  await Todo.deleteMany({});
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
      task: 'Test Todo',
      description: 'Test description',
      subtasks: [
        { subtaskText: 'subtask 1', isCompleted: false },
        { subtaskText: 'subtask 2', isCompleted: false },
      ]
    };

    const response = await request(app)
      .post('/api/todos')
      .send(todo)
      .expect(201);

    // ✅ Check correct fields from schema
    expect(response.body.task).toBe(todo.task);
    expect(response.body.description).toBe(todo.description);
    expect(response.body.completed).toBe(false);
    expect(response.body.subtasks).toHaveLength(2);
    expect(response.body.subtasks[0].subtaskText).toBe('subtask 1');
    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('createdAt');    
  });

  test('POST /api/todos/ should fail without task', async () => {
    const todo = {
      description: 'Test description'
      // Missing "task" field
    };

    const response = await request(app)
      .post('/api/todos')
      .send(todo)
      .expect(400);

    expect(response.body.message).toBe('Task is required.');
  });

  test('PATCH /api/todos/:id should update a todo', async () => {
    // First create a todo
    const todo = new Todo({
      task: 'Original Task',
      description: 'Original description'
    });
    await todo.save();

    // Update it
    const updates = {
      task: 'Updated Task',
      completed: true
    };

    const response = await request(app)
      .patch(`/api/todos/${todo._id}`)
      .send(updates)
      .expect(200);

    expect(response.body.task).toBe('Updated Task');
    expect(response.body.completed).toBe(true);
  });

  test('DELETE /api/todos/:id should delete a todo', async () => {
    // First create a todo
    const todo = new Todo({
      task: 'Todo to delete'
    });
    await todo.save();

    // Delete it
    await request(app)
      .delete(`/api/todos/${todo._id}`)
      .expect(200);

    // Verify it's gone
    const deletedTodo = await Todo.findById(todo._id);
    expect(deletedTodo).toBeNull();
  });  
});