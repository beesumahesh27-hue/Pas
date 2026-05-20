import axios from 'axios';

const BASE = '/api/jobs';

export const JOB_CATEGORIES = [
  { key: 'work',        label: 'Work',         color: '#1976d2' },
  { key: 'maintenance', label: 'Maintenance',  color: '#fb8c00' },
  { key: 'deployment',  label: 'Deployment',   color: '#43a047' },
  { key: 'incident',    label: 'Incident',     color: '#e53935' },
  { key: 'personal',    label: 'Personal',     color: '#8e24aa' },
  { key: 'meeting',     label: 'Meeting',      color: '#00897b' },
];

export const getCategoryColor = (key) =>
  JOB_CATEGORIES.find(c => c.key === key)?.color || '#1976d2';

const fromApi = (j) => ({
  id:          j.id,
  title:       j.title,
  category:    j.category,
  location:    j.location || '',
  description: j.description || '',
  allDay:      !!j.all_day,
  start:       j.start,
  end:         j.end,
  createdAt:   j.created_at,
  updatedAt:   j.updated_at,
});

const toApi = (j) => ({
  title:       j.title,
  category:    j.category,
  location:    j.location || null,
  description: j.description || null,
  all_day:     !!j.allDay,
  start:       j.start,
  end:         j.end,
});

export const listJobs = async (params = {}) => {
  const { data } = await axios.get(`${BASE}/`, { params });
  return data.map(fromApi);
};

export const createJob = async (job) => {
  const { data } = await axios.post(`${BASE}/`, toApi(job));
  return fromApi(data);
};

export const updateJob = async (id, patch) => {
  const { data } = await axios.put(`${BASE}/${id}`, toApi(patch));
  return fromApi(data);
};

export const deleteJob = async (id) => {
  await axios.delete(`${BASE}/${id}`);
};

export const jobsBetween = async (startISO, endISO) => {
  const { data } = await axios.get(`${BASE}/`, { params: { start: startISO, end: endISO } });
  return data.map(fromApi);
};

export const getJobStats = async () => {
  const { data } = await axios.get(`${BASE}/stats`);
  return data || {};
};

export const listDueNotifications = async () => {
  const { data } = await axios.get('/api/notifications/due');
  return data;
};

export const dismissNotification = async (id) => {
  await axios.post(`/api/notifications/${id}/dismiss`);
};
