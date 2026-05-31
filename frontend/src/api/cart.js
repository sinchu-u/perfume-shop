import api from './axios';

export const getCart = () =>
  api.get('/backend/cart');

export const addCartItem = (data) =>
  api.post('/backend/cart/items', data);

export const updateCartItem = (itemId, data) =>
  api.put(`/backend/cart/items/${itemId}`, data);

export const deleteCartItem = (itemId) =>
  api.delete(`/backend/cart/items/${itemId}`);
