const API_URL = 'http://localhost:5000';

export const getActivityLogs = async (token, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.action) params.append('action', filters.action);
  if (filters.entity_type) params.append('entity_type', filters.entity_type);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.limit) params.append('limit', filters.limit);

  const queryString = params.toString();
  const url = `${API_URL}/activity-logs${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await res.json();
  return result.success ? result.data : [];
};

export const getRecentActivity = async (token, limit = 10) => {
  const res = await fetch(`${API_URL}/activity-logs/recent?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await res.json();
  return result.success ? result.data : [];
};

export const getActivityStats = async (token) => {
  const res = await fetch(`${API_URL}/activity-logs/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await res.json();
  return result.success ? result.data : null;
};

export const getEntityLogs = async (entityType, entityId, token) => {
  const res = await fetch(`${API_URL}/activity-logs/entity/${entityType}/${entityId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await res.json();
  return result.success ? result.data : [];
};
