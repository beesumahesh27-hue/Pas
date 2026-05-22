import axios from 'axios';

export const login = async ({ email, password }) => {
  const { data } = await axios.post('/api/auth/login', { email, password });
  return data;
};

export const signup = async ({ email, name, password }) => {
  const { data } = await axios.post('/api/auth/signup', { email, name, password });
  return data;
};

export const fetchMe = async () => {
  const { data } = await axios.get('/api/auth/me');
  return data;
};
