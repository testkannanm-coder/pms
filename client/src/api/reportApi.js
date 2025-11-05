import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getReports = async (token) => {
  const response = await axios.get(`${API_URL}/reports`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getReportsByAppointment = async (appointmentId, token) => {
  const response = await axios.get(`${API_URL}/reports/appointment/${appointmentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createReport = async (reportData, token) => {
  const response = await axios.post(`${API_URL}/reports`, reportData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateReport = async (id, reportData, token) => {
  const response = await axios.put(`${API_URL}/reports/${id}`, reportData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteReport = async (id, token) => {
  const response = await axios.delete(`${API_URL}/reports/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const uploadReportDocuments = async (reportId, files, token) => {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("documents", files[i]);
  }
  const response = await axios.post(`${API_URL}/reports/${reportId}/documents`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteReportDocument = async (documentId, token) => {
  const response = await axios.delete(`${API_URL}/reports/documents/${documentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const downloadReportDocument = async (documentId, fileName, token) => {
  const response = await axios.get(`${API_URL}/reports/documents/${documentId}/download`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob', // Important for file downloads
  });
  
  // Create blob link to download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return { success: true, message: 'File downloaded successfully' };
};
