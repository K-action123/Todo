// src/App.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Import the new components and API functions
import TaskInputForm from './components/TaskInputForm';
import TodoList from './components/TodoList';
import TodoDetailsModal from './components/TodoDetailsModal';
import { fetchTodos as apiFetchTodos, createTodo as apiCreateTodo, updateTodo as apiUpdateTodo, deleteTodo as apiDeleteTodo } from './API/todoApi';

function App() {
    const theme = useTheme();
    const [todos, setTodos] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false); // State for adding new main task

    const [openDetailsModal, setOpenDetailsModal] = useState(false);
    const [selectedTodo, setSelectedTodo] = useState(null);

    useEffect(() => {
        handleFetchTodos();
    }, []);

    const handleFetchTodos = async () => {
        setLoading(true);
        try {
            const data = await apiFetchTodos();
            setTodos(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching todos:', err);
            setError('Failed to load tasks. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (todoData) => { // This now receives the full todoData object
        if (todoData.task.trim() === '') {
            setError('Task cannot be empty!');
            return;
        }
        setAdding(true);
        try {
            const newTodo = await apiCreateTodo(todoData);
            setTodos([newTodo, ...todos]);
            setError(null);
        } catch (err) {
            console.error('Error adding todo:', err);
            setError('Failed to add task. Please try again.');
        } finally {
            setAdding(false);
        }
    };

    const handleToggleTodoComplete = async (id, completed) => {
        try {
            const updatedTodo = await apiUpdateTodo(id, { completed: !completed });
            setTodos(todos.map(todo =>
                todo._id === id ? updatedTodo : todo
            ));
            setError(null);
        } catch (err) {
            console.error('Error updating todo:', err);
            setError('Failed to update task status. Please try again.');
        }
    };

    const handleDeleteTodo = async (id) => {
        try {
            await apiDeleteTodo(id);
            setTodos(todos.filter(todo => todo._id !== id));
            setError(null);
        } catch (err) {
            console.error('Error deleting todo:', err);
            setError('Failed to delete task. Please try again.');
        }
    };

    const handleOpenDetailsModal = (todo) => {
        setSelectedTodo(todo);
        setOpenDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setSelectedTodo(null);
        setOpenDetailsModal(false);
        handleFetchTodos(); // Refresh todos to get the latest state after modal changes
    };

    // This function will be passed to TodoDetailsModal to update main task or subtasks
    const handleUpdateTodoInModal = async (id, updateData) => {
        try {
            const updatedTodo = await apiUpdateTodo(id, updateData);
            // Update the selectedTodo state in App.js to reflect immediate changes in modal
            setSelectedTodo(updatedTodo);
            // Also update the main todos list
            setTodos(todos.map(todo => (todo._id === id ? updatedTodo : todo)));
            setError(null);
        } catch (err) {
            console.error('Error updating todo in modal:', err);
            setError('Failed to update task details. Please try again.');
        }
    };

    return (
        <Container
            maxWidth="md"
            sx={{
                mt: 6,
                bgcolor: theme.palette.background.default,
                minHeight: 'calc(100vh - 48px)',
                py: 4,
                borderRadius: 3,
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            }}
        >
            <Typography
                variant="h4"
                component="h1"
                gutterBottom
                align="center"
                sx={{
                    color: theme.palette.primary.dark,
                    mb: 4,
                }}
            >
                To-Do List
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* Task Input Form Component */}
            <TaskInputForm
                onAddTask={handleAddTask}
                adding={adding}
                error={error} // Pass error down if you want input form to show specific errors
            />

            {/* Todo List Component */}
            <TodoList
                todos={todos}
                loading={loading}
                error={error}
                onToggleComplete={handleToggleTodoComplete}
                onDeleteTodo={handleDeleteTodo}
                onOpenDetails={handleOpenDetailsModal}
            />

            {/* Todo Details Modal Component */}
            <TodoDetailsModal
                open={openDetailsModal}
                todo={selectedTodo}
                onClose={handleCloseDetailsModal}
                onUpdateTodo={handleUpdateTodoInModal}
            />
        </Container>
    );
}

export default App;