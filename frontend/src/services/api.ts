import axios from 'axios';
import { ENV } from '../utils/env';

export const api = axios.create({
    baseURL: ENV.API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('g2g_token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Add response interceptor
api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('g2g_token');
        window.location.href = '/auth';
    }
    return Promise.reject(error);
});
