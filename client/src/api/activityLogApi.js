const API_URL = 'http://localhost:5000';

export const getActivityLogs = async (token) => {
  const url = `${API_URL}/activity-logs`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await res.json();
  return result.success ? result.data : [];
};
