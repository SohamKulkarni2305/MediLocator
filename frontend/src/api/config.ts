const trimTrailingSlashes = (value: string): string => value.replace(/\/+$/, '');
const withApiPath = (value: string): string => /\/api$/i.test(value) ? value : `${value}/api`;

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const configuredBackendUrl = import.meta.env.VITE_BACKEND_URL?.trim();

// `/api` is the local Vite proxy path. In production, use the deployed backend
// origin so browser requests do not accidentally go to the frontend host.
export const API_BASE_URL = configuredApiUrl && configuredApiUrl !== '/api'
  ? withApiPath(trimTrailingSlashes(configuredApiUrl))
  : configuredBackendUrl
    ? withApiPath(trimTrailingSlashes(configuredBackendUrl))
    : '/api';
