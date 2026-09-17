import axios from 'axios';
import { API_BASE_URL } from './config';

// Create a singleton Axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const isAuthRequest = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'].some((path) => requestUrl.includes(path));

    if (error.response?.status === 401 && !isAuthRequest && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        // Attempt to refresh token
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);

        // Update authorization header and retry original request
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login (or let app handle it)
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
