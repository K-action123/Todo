// src/components/TodoList.js
import React from 'react';
import { List, ListItem, ListItemText, Checkbox, IconButton, Box, Typography, CircularProgress, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useTheme } from '@mui/material/styles';

function TodoList({ todos, loading, error, onToggleComplete, onDeleteTodo, onOpenDetails }) {
    const theme = useTheme();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2, color: theme.palette.text.secondary }}>
                    Loading tasks...
                </Typography>
            </Box>
        );
    }

    if (error) { // Display error from parent App.js
        return <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>;
    }

    if (todos.length === 0) {
        return (
            <Box
                sx={{
                    textAlign: 'center',
                    py: 5,
                    color: theme.palette.text.secondary,
                    bgcolor: theme.palette.background.paper,
                    borderRadius: 2,
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)'
                }}
            >
                <Typography variant="h5" gutterBottom>
                    No tasks yet!
                </Typography>
                <Typography variant="body1">
                    Start by adding a new task above.
                </Typography>
            </Box>
        );
    }

    return (
        <List>
            {todos.map((todo) => (
                <ListItem
                    key={todo._id}
                    secondaryAction={
                        <IconButton edge="end" aria-label="delete" onClick={() => onDeleteTodo(todo._id)} color="secondary">
                            <DeleteIcon />
                        </IconButton>
                    }
                    sx={{
                        backgroundColor: todo.completed ? theme.palette.primary.light + '1A' : theme.palette.background.paper,
                        transition: 'background-color 0.3s ease',
                        pr: 7,
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                        },
                    }}
                    onClick={() => onOpenDetails(todo)}
                >
                    <Checkbox
                        icon={<RadioButtonUncheckedIcon />}
                        checkedIcon={<CheckCircleOutlineIcon color="primary" />}
                        edge="start"
                        checked={todo.completed}
                        tabIndex={-1}
                        disableRipple
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent ListItem onClick from firing
                            onToggleComplete(todo._id, todo.completed);
                        }}
                    />
                    <ListItemText
                        primary={todo.task}
                        sx={{
                            textDecoration: todo.completed ? 'line-through' : 'none',
                            color: todo.completed ? theme.palette.text.secondary : theme.palette.text.primary,
                            transition: 'color 0.3s ease, text-decoration 0.3s ease',
                        }}
                    />
                </ListItem>
            ))}
        </List>
    );
}

export default TodoList;