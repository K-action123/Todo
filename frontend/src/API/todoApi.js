// src/api/todoApi.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/todos';

export const fetchTodos = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const createTodo = async (todoData) => {
    const response = await axios.post(API_URL, todoData);
    return response.data;
};

export const updateTodo = async (id, updateData) => {
    const response = await axios.patch(`${API_URL}/${id}`, updateData);
    return response.data;
};

export const deleteTodo = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    return id; // Return the ID of the deleted todo
};