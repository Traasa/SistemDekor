import axios from 'axios';

// Use current domain for API calls (works with both dev and production)
const API_BASE_URL = `${window.location.origin}/api`;

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
    },
    withCredentials: true, // Important: send cookies with requests
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add XSRF token for stateful requests
        const xsrfToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];
        
        if (xsrfToken) {
            config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);

export default api;
