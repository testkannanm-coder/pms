const API_URL = 'http://localhost:5000';

// Get all appointments with optional filters
export const getAppointments = async (token, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.patient_id) params.append('patient_id', filters.patient_id);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const queryString = params.toString();
  const url = `${API_URL}/appointments${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await res.json();
  return result.success ? result.data : [];
};

// Get today's appointments
export const getTodaysAppointments = async (token) => {
  const res = await fetch(`${API_URL}/appointments/today`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await res.json();
  return result.success ? result.data : [];
};

// Get upcoming appointments
export const getUpcomingAppointments = async (token, days = 7) => {
  const res = await fetch(`${API_URL}/appointments/upcoming?days=${days}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await res.json();
  return result.success ? result.data : [];
};

// Get appointment statistics
export const getAppointmentStats = async (token) => {
  const res = await fetch(`${API_URL}/appointments/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await res.json();
  return result.success ? result.data : null;
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
