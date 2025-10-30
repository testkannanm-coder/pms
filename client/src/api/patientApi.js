const API_URL = 'http://localhost:5000';

// Authentication APIs
export const registerUser = async (email, password, name) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  return res.json();
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

export const getPatients = async (token) => {
  const res = await fetch(`${API_URL}/patients`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await res.json();
  return result.success ? result.data : [];
};

export const getPatientById = async (id, token) => {
  const res = await fetch(`${API_URL}/patients/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await res.json();
  return result.success ? result.data : null;
};

export const addPatient = async (patient, token) => {
  const res = await fetch(`${API_URL}/patients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(patient),
  });
  return res.json();
};

export const updatePatient = async (id, patient, token) => {
  const res = await fetch(`${API_URL}/patients/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(patient),
  });
  return res.json();
};

export const deletePatient = async (id, token) => {
  const res = await fetch(`${API_URL}/patients/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
