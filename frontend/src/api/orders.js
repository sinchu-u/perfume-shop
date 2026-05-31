import api from './axios';

export const getUserOrders = () =>
  api.get('/backend/order');

export const getAllOrders = (params) =>
  api.get('/backend/order/all', { params });

export const getOrderById = (id) =>
  api.get(`/backend/order/${id}`);

export const createOrder = (data) =>
  api.post('/backend/order', data);

export const updateOrderStatus = (id, data) =>
  api.put(`/backend/order/${id}/status`, data);
