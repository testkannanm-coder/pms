const API_URL = 'http://localhost:5000';

// Get all medical records
export const getMedicalRecords = async (token, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.patient_id) params.append('patient_id', filters.patient_id);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  
  const queryString = params.toString();
  const url = `${API_URL}/medical-records${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await res.json();
  return result.success ? result.data : [];
};

// Get patient medical history
export const getPatientHistory = async (patientId, token) => {
  const res = await fetch(`${API_URL}/medical-records/patient/${patientId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await res.json();
  return result.success ? result.data : [];
};

// Get medical record by appointment ID
export const getMedicalRecordByAppointment = async (appointmentId, token) => {
  const res = await fetch(`${API_URL}/medical-records/appointment/${appointmentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

// Get medical record by ID
export const getMedicalRecordById = async (id, token) => {
  const res = await fetch(`${API_URL}/medical-records/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

// Create medical record
export const createMedicalRecord = async (recordData, token) => {
  const res = await fetch(`${API_URL}/medical-records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(recordData),
  });
  return res.json();
};

// Update medical record
export const updateMedicalRecord = async (id, recordData, token) => {
  const res = await fetch(`${API_URL}/medical-records/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(recordData),
  });
  return res.json();
};

// Delete medical record
export const deleteMedicalRecord = async (id, token) => {
  const res = await fetch(`${API_URL}/medical-records/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

// Add prescription
export const addPrescription = async (medicalRecordId, prescriptionData, token) => {
  const res = await fetch(`${API_URL}/medical-records/${medicalRecordId}/prescriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(prescriptionData),
  });
  return res.json();
};

// Update prescription
export const updatePrescription = async (id, prescriptionData, token) => {
  const res = await fetch(`${API_URL}/medical-records/prescriptions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(prescriptionData),
  });
  return res.json();
};

// Delete prescription
export const deletePrescription = async (id, token) => {
  const res = await fetch(`${API_URL}/medical-records/prescriptions/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
