const API_URL = 'http://localhost:5000';

// Get all bills
export const getAllBills = async (token) => {
  const res = await fetch(`${API_URL}/bills`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

// Get bill by ID
export const getBillById = async (id, token) => {
  const res = await fetch(`${API_URL}/bills/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

// Get bills by patient ID
export const getBillsByPatientId = async (patientId, token) => {
  const res = await fetch(`${API_URL}/bills/patient/${patientId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

// Get bill by appointment ID
export const getBillByAppointmentId = async (appointmentId, token) => {
  const res = await fetch(`${API_URL}/bills/appointment/${appointmentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

// Create bill
export const createBill = async (billData, token) => {
  const res = await fetch(`${API_URL}/bills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(billData),
  });
  return res.json();
};

// Update bill
export const updateBill = async (id, billData, token) => {
  const res = await fetch(`${API_URL}/bills/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(billData),
  });
  return res.json();
};

// Update payment status
export const updatePaymentStatus = async (id, paymentData, token) => {
  const res = await fetch(`${API_URL}/bills/${id}/payment`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(paymentData),
  });
  return res.json();
};

// Delete bill
export const deleteBill = async (id, token) => {
  const res = await fetch(`${API_URL}/bills/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
