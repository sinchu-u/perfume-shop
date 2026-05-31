import api from './axios';

export const login = (data) =>
  api.post('/backend/account/login', data);

export const register = (data) =>
  api.post('/backend/account/register', data);
