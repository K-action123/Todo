const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const todoApi = {
  getAll: () =>
    fetch(`${API_URL}/todos`).then(handleResponse),

  create: (payload) =>
    fetch(`${API_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handleResponse),

  update: (id, payload) =>
    fetch(`${API_URL}/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handleResponse),

  delete: (id) =>
    fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' }).then(handleResponse),
};