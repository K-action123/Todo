require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const Todo = require('./models/Todo');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Apply rate limiting to API routes to protect database operations
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs for /api routes
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});

app.use('/api', apiLimiter);

// --- API ROUTES ---

// Health check endpoint for Docker (ALREADY PRESENT - GOOD!)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'todo-backend',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// 1. Get All todos
app.get('/api/todos', async (req, res) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 });
        res.json(todos);
    } catch (err) {
        console.error("Error fetching todos: ", err);
        res.status(500).json({ message: 'Server Error: could not fetch todos.' });
    }
});

// 2. Create new todo
app.post('/api/todos', async (req, res) => {
    const { task, description, subtasks } = req.body;

    if (!task || task.trim() === '') {
        return res.status(400).json({ message: 'Task is required.' });
    }

    const newTodo = new Todo({
        task: task.trim(),
        description: description ? description.trim() : '',
        subtasks: subtasks && Array.isArray(subtasks) 
            ? subtasks
                .filter(sub => sub.subtaskText && sub.subtaskText.trim() !== '')  // ← ADD THIS LINE
                .map(sub => ({
                    subtaskText: sub.subtaskText.trim(),
                    isCompleted: sub.isCompleted || false
                }))
            : []
    });

    try {
        const savedTodo = await newTodo.save();
        res.status(201).json(savedTodo);
    } catch (err) {
        console.error('Error adding todo:', err);
        res.status(500).json({ message: 'Server Error: Could not add todo.' });
    }
});

// 3. Update todo
app.patch('/api/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { task, completed, description, subtasks } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Todo ID.' });
        }

        const todo = await Todo.findById(id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found.' });
        }

        if (task !== undefined) {
            todo.task = task.trim();
        }
        if (completed !== undefined) {
            todo.completed = completed;
        }
        if (description !== undefined) {
            todo.description = description.trim();
        }
        if (subtasks !== undefined) {
            if (Array.isArray(subtasks)) {
                todo.subtasks = subtasks
                    .filter(sub => sub.subtaskText && sub.subtaskText.trim() !== '')  // ← ADD THIS LINE
                    .map(sub => ({
                        subtaskText: sub.subtaskText.trim(),
                        isCompleted: sub.isCompleted || false,
                    }));
            } else {
                return res.status(400).json({ message: 'Subtasks must be an array.' });
            }
        }

        const updatedTodo = await todo.save();
        res.status(200).json(updatedTodo);
    } catch (err) {
        console.error(`Error updating todo with ID ${id}:`, err);
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid Todo ID format.' });
        }
        res.status(500).json({ message: 'Server Error: Could not update todo.' });
    }
});
// 4. Delete todo
app.delete('/api/todos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await Todo.deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Todo not found.' });
        }
        res.json({ message: 'Todo deleted successfully!' });
    } catch (err) {
        console.error('Error deleting todo with ID %s:', id, err);
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid Todo ID format.' });
        }
        // FIXED: was res.result(500), should be res.status(500)
        res.status(500).json({ message: 'Server Error: Could not delete todo.' });
    }
});

if (require.main === module) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log('MongoDB connected successfully');
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
                console.log(`Access backend at http://localhost:${PORT}/api/todos`);
                console.log(`Health check at http://localhost:${PORT}/health`);
            });
        })
        .catch(err => {
            console.error('MongoDB connection error:', err);
            process.exit(1);
        });
}

module.exports= app;