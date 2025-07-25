// src/components/TodoDetailsModal.js
import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, List, ListItem, ListItemText,
    Checkbox, IconButton, Box, Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useTheme } from '@mui/material/styles';

function TodoDetailsModal({ open, todo, onClose, onUpdateTodo }) {
    const theme = useTheme();
    const [editedDescription, setEditedDescription] = useState('');
    const [newSubtaskInModal, setNewSubtaskInModal] = useState('');
    const [localSubtasks, setLocalSubtasks] = useState([]); // Manage subtasks locally before saving

    // Update local state when 'todo' prop changes (e.g., when modal opens or todo is updated)
    useEffect(() => {
        if (todo) {
            setEditedDescription(todo.description);
            setLocalSubtasks(todo.subtasks || []); // Initialize with existing subtasks
        }
    }, [todo]);

    const handleDescriptionChange = () => {
        if (todo && editedDescription.trim() !== todo.description.trim()) {
            onUpdateTodo(todo._id, { description: editedDescription.trim() });
        }
    };

    const handleAddSubtask = () => {
        if (newSubtaskInModal.trim() !== '') {
            const newSubtask = {
                subtaskText: newSubtaskInModal.trim(),
                isCompleted: false,
                // _id will be assigned by MongoDB on save
            };
            const updatedSubtasks = [...localSubtasks, newSubtask];
            setLocalSubtasks(updatedSubtasks); // Update local state immediately
            onUpdateTodo(todo._id, { subtasks: updatedSubtasks }); // Send to parent to update backend
            setNewSubtaskInModal('');
        }
    };

    const handleToggleSubtaskComplete = (subtaskId, currentStatus) => {
        const updatedSubtasks = localSubtasks.map(sub =>
            sub._id === subtaskId ? { ...sub, isCompleted: !currentStatus } : sub
        );
        setLocalSubtasks(updatedSubtasks); // Update local state immediately
        onUpdateTodo(todo._id, { subtasks: updatedSubtasks }); // Send to parent to update backend
    };

    const handleDeleteSubtask = (subtaskId) => {
        const updatedSubtasks = localSubtasks.filter(sub => sub._id !== subtaskId);
        setLocalSubtasks(updatedSubtasks); // Update local state immediately
        onUpdateTodo(todo._id, { subtasks: updatedSubtasks }); // Send to parent to update backend
    };

    if (!todo) return null; // Don't render modal if no todo is selected

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {todo.task}
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {/* Description Section */}
                <Typography variant="h6" gutterBottom>Description</Typography>
                <TextField
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    onBlur={handleDescriptionChange} // Save on blur
                    placeholder="Add a detailed description for this task..."
                    sx={{ mb: 3 }}
                />

                {/* Subtasks Section */}
                <Typography variant="h6" gutterBottom>Subtasks</Typography>
                {localSubtasks.length > 0 ? (
                    <List dense>
                        {localSubtasks.map((subtask) => (
                            <ListItem
                                key={subtask._id || subtask.subtaskText} // Use _id if available, fallback to text for new unsaved
                                secondaryAction={
                                    <IconButton edge="end" aria-label="delete subtask" onClick={() => handleDeleteSubtask(subtask._id)} size="small" color="secondary">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                }
                            >
                                <Checkbox
                                    edge="start"
                                    checked={subtask.isCompleted}
                                    disableRipple
                                    onClick={() => handleToggleSubtaskComplete(subtask._id, subtask.isCompleted)}
                                    icon={<RadioButtonUncheckedIcon fontSize="small" />}
                                    checkedIcon={<CheckCircleOutlineIcon color="primary" fontSize="small" />}
                                />
                                <ListItemText
                                    primary={subtask.subtaskText}
                                    sx={{
                                        textDecoration: subtask.isCompleted ? 'line-through' : 'none',
                                        color: subtask.isCompleted ? theme.palette.text.secondary : theme.palette.text.primary,
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>No subtasks yet.</Typography>
                )}

                {/* Add New Subtask Input */}
                <Box display="flex" mt={2} gap={1}>
                    <TextField
                        label="Add new subtask"
                        variant="outlined"
                        fullWidth
                        size="small"
                        value={newSubtaskInModal}
                        onChange={(e) => setNewSubtaskInModal(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleAddSubtask();
                            }
                        }}
                    />
                    <Button variant="contained" onClick={handleAddSubtask} disabled={newSubtaskInModal.trim() === ''}>
                        Add
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

export default TodoDetailsModal;