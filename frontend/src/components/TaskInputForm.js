// src/components/TaskInputForm.js
import React, { useState } from 'react';
import { TextField, Button, Box, Chip, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function TaskInputForm({ onAddTask, adding, error }) {
    const [newTask, setNewTask] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newSubtaskInput, setNewSubtaskInput] = useState('');
    const [currentNewSubtasks, setCurrentNewSubtasks] = useState([]); // Stores subtask texts before they become objects

    const handleAddSubtask = () => {
        if (newSubtaskInput.trim() !== '') {
            setCurrentNewSubtasks([...currentNewSubtasks, newSubtaskInput.trim()]);
            setNewSubtaskInput('');
        }
    };

    const handleAddTaskClick = () => {
        // When adding a task, format subtasks into objects for the backend
        const formattedSubtasks = currentNewSubtasks.map(text => ({
            subtaskText: text,
            isCompleted: false
        }));
        onAddTask({
            task: newTask.trim(),
            description: newDescription.trim(),
            subtasks: formattedSubtasks
        });
        // Clear all fields after adding
        setNewTask('');
        setNewDescription('');
        setNewSubtaskInput('');
        setCurrentNewSubtasks([]);
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            mb={4}
            gap={2}
        >
            <TextField
                label="Add a new task..."
                variant="outlined"
                fullWidth
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => {
                    if (e.key === 'Enter' && !adding) {
                        handleAddTaskClick();
                    }
                }}
                disabled={adding}
            />
            <TextField
                label="Description (optional)"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                disabled={adding}
            />
            <Box display="flex" alignItems="center" gap={1}>
                <TextField
                    label="Add a subtask (optional)"
                    variant="outlined"
                    fullWidth
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleAddSubtask();
                        }
                    }}
                    disabled={adding}
                />
                <Button
                    variant="outlined"
                    onClick={handleAddSubtask}
                    disabled={adding || newSubtaskInput.trim() === ''}
                >
                    Add Subtask
                </Button>
            </Box>
            {currentNewSubtasks.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {currentNewSubtasks.map((subtask, index) => (
                        <Chip
                            key={index}
                            label={subtask}
                            onDelete={() => setCurrentNewSubtasks(currentNewSubtasks.filter((_, i) => i !== index))}
                            color="primary"
                            variant="outlined"
                        />
                    ))}
                </Box>
            )}
            <Button
                variant="contained"
                color="primary"
                onClick={handleAddTaskClick}
                disabled={adding || newTask.trim() === ''}
                endIcon={adding ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                sx={{ minWidth: '120px' }}
            >
                {adding ? 'Adding...' : 'Add Task'}
            </Button>
        </Box>
    );
}

export default TaskInputForm;