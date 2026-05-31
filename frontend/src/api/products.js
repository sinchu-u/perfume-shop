import api from './axios';

export const getProducts = (params) =>
  api.get('/backend/product', { params });

export const getProductById = (id) =>
  api.get(`/backend/product/${id}`);

export const createProduct = (formData) =>
  api.post('/backend/product', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateProduct = (id, formData) =>
  api.put(`/backend/product/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteProduct = (id) =>
  api.delete(`/backend/product/${id}`);

// Variants
export const createVariant = (productId, data) =>
  api.post(`/backend/product/${productId}/variant`, data);

export const updateVariant = (productId, id, data) =>
  api.put(`/backend/product/${productId}/variant/${id}`, data);

export const deleteVariant = (id) =>
  api.delete(`/backend/product/variant/${id}`);

export const getVolumes = () =>
  api.get('/backend/product/volumes');

// Brands
export const getBrands = () =>
  api.get('/backend/brand');

export const getBrandById = (id) =>
  api.get(`/backend/brand/${id}`);

export const createBrand = (data) =>
  api.post('/backend/brand', data);

export const updateBrand = (id, data) =>
  api.put(`/backend/brand/${id}`, data);

export const deleteBrand = (id) =>
  api.delete(`/backend/brand/${id}`);

// Categories
export const getCategories = () =>
  api.get('/backend/category');

export const getCategoryById = (id) =>
  api.get(`/backend/category/${id}`);

export const createCategory = (data) =>
  api.post('/backend/category', data);

export const updateCategory = (id, data) =>
  api.put(`/backend/category/${id}`, data);

export const deleteCategory = (id) =>
  api.delete(`/backend/category/${id}`);

// ScentTypes
export const getScentTypes = () =>
  api.get('/backend/scent_type');

export const createScentType = (data) =>
  api.post('/backend/scent_type', data);

export const updateScentType = (id, data) =>
  api.put(`/backend/scent_type/${id}`, data);

export const deleteScentType = (id) =>
  api.delete(`/backend/scent_type/${id}`);

// Comments
export const getComments = (params) =>
  api.get('/backend/comment', { params });

export const createComment = (productId, data) =>
  api.post(`/backend/comment/${productId}`, data);

export const updateComment = (id, data) =>
  api.put(`/backend/comment/${id}`, data);

export const deleteComment = (id) =>
  api.delete(`/backend/comment/${id}`);
