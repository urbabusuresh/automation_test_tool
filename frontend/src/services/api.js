import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const testService = {
  // Get all tests
  getAllTests: async () => {
    const response = await api.get('/tests');
    return response.data;
  },

  // Get single test
  getTest: async (id) => {
    const response = await api.get(`/tests/${id}`);
    return response.data;
  },

  // Create test
  createTest: async (testData) => {
    const response = await api.post('/tests', testData);
    return response.data;
  },

  // Update test
  updateTest: async (id, testData) => {
    const response = await api.put(`/tests/${id}`, testData);
    return response.data;
  },

  // Delete test
  deleteTest: async (id) => {
    const response = await api.delete(`/tests/${id}`);
    return response.data;
  },

  // Generate script
  generateScript: async (id, framework) => {
    const response = await api.post(`/tests/${id}/generate`, { framework });
    return response.data;
  },
};

export const executionService = {
  // Get all results
  getAllResults: async () => {
    const response = await api.get('/executions');
    return response.data;
  },

  // Get single result
  getResult: async (id) => {
    const response = await api.get(`/executions/${id}`);
    return response.data;
  },

  // Run test
  runTest: async (testId, options = {}) => {
    const response = await api.post(`/executions/run/${testId}`, options);
    return response.data;
  },

  // Get execution status
  getStatus: async (executionId) => {
    const response = await api.get(`/executions/status/${executionId}`);
    return response.data;
  },
};

export default api;
