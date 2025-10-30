const API_URL = 'http://localhost:5000';

// Get all users
export const getUsers = async (token) => {
  const url = `${API_URL}/auth/users`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await res.json();
  return result.success ? result.data : [];
};

// Create user
export const createUser = async (userData, token) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  return res.json();
};

// Update user
export const updateUser = async (id, userData, token) => {
  const res = await fetch(`${API_URL}/auth/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  return res.json();
};

// Delete user
export const deleteUser = async (id, token) => {
  const res = await fetch(`${API_URL}/auth/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

// Get users by role (for dropdowns)
export const getUsersByRole = async (token, role) => {
  const res = await fetch(`${API_URL}/auth/users?role=${role}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await res.json();
  return result.success ? result.data : [];
};
