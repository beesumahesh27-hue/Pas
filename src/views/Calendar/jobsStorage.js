import axios from 'axios';

const BASE = '/api/jobs';

let _categoriesCache = [];

export const listJobCategories = async () => {
  const { data } = await axios.get(`${BASE}/categories`);
  _categoriesCache = Array.isArray(data) ? data : [];
  return _categoriesCache;
};

export const listRegions = async () => {
  const { data } = await axios.get('/api/regions/');
  return Array.isArray(data) ? data : [];
};

export const getCategoryColor = (key) =>
  _categoriesCache.find(c => c.key === key)?.color || '#1976d2';

export const getCategoryLabel = (key) =>
  _categoriesCache.find(c => c.key === key)?.label || key;

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
