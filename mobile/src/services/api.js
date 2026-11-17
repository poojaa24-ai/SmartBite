import axios from 'axios';
import { Platform } from 'react-native';

// For Android emulator 10.0.2.2 points to host machine, on iOS simulator/web localhost works
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

let userToken = null;

export const setAuthToken = (token) => {
  userToken = token;
};

api.interceptors.request.use(
  (config) => {
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
