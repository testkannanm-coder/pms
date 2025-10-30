const API_URL = 'http://localhost:5000';

// Get all appointments with optional filters
export const getAppointments = async (token) => {
  const url = `${API_URL}/appointments`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await res.json();
  return result.success ? result.data : [];
};

// Get single appointment by ID
export const getAppointmentById = async (id, token) => {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await res.json();
  return result.success ? result.data : null;
};

// Create new appointment
export const createAppointment = async (appointment, token) => {
  const res = await fetch(`${API_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(appointment),
  });
  return res.json();
};

// Update appointment
export const updateAppointment = async (id, appointment, token) => {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(appointment),
  });
  return res.json();
};

// Cancel appointment
export const cancelAppointment = async (id, token) => {
  const res = await fetch(`${API_URL}/appointments/${id}/cancel`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

// Change appointment status
export const changeAppointmentStatus = async (id, status, token) => {
  const res = await fetch(`${API_URL}/appointments/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  return res.json();
};

// Delete appointment
export const deleteAppointment = async (id, token) => {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
