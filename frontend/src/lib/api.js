/**
 * API client for MedVision SSL Framework
 */
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============== DATASETS ==============

export const datasetsApi = {
  getAll: () => api.get('/datasets'),
  getById: (id) => api.get(`/datasets/${id}`),
  create: (data) => api.post('/datasets', data),
  delete: (id) => api.delete(`/datasets/${id}`),
};

// ============== MODEL CONFIGURATIONS ==============

export const modelsApi = {
  getAll: () => api.get('/models'),
  getById: (id) => api.get(`/models/${id}`),
  create: (data) => api.post('/models', data),
  delete: (id) => api.delete(`/models/${id}`),
};

// ============== EXPERIMENTS ==============

export const experimentsApi = {
  getAll: () => api.get('/experiments'),
  getById: (id) => api.get(`/experiments/${id}`),
  create: (data) => api.post('/experiments', data),
  start: (id) => api.post(`/experiments/${id}/start`),
  getMetrics: (id) => api.get(`/experiments/${id}/metrics`),
  delete: (id) => api.delete(`/experiments/${id}`),
};

// ============== FINE-TUNING ==============

export const finetuneApi = {
  getAll: () => api.get('/finetune'),
  create: (data) => api.post('/finetune', data),
  start: (id) => api.post(`/finetune/${id}/start`),
};

// ============== EVALUATIONS ==============

export const evaluationsApi = {
  getAll: () => api.get('/evaluations'),
  compare: () => api.get('/evaluations/compare'),
};

// ============== VISUALIZATION ==============

export const visualizationApi = {
  getEmbeddings: (numSamples = 100) => 
    api.get(`/visualization/embeddings?num_samples=${numSamples}`),
  getSliceData: (sliceIdx, totalSlices = 128) => 
    api.get(`/visualization/slice/${sliceIdx}?total_slices=${totalSlices}`),
};

// ============== DASHBOARD ==============

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

// ============== SEED DATA ==============

export const seedApi = {
  seedData: () => api.post('/seed'),
};

export default api;
