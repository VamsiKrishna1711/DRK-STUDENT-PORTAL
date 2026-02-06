// API configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const apiClient = {
  baseURL: API_URL,
  getEndpoint: (path) => `${API_URL}${path}`,
};

export default API_URL;
