const trimTrailingSlashes = (value: string): string => value.replace(/\/+$/, '');

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const configuredBackendUrl = import.meta.env.VITE_BACKEND_URL?.trim();

// `/api` is the local Vite proxy path. In production, use the deployed backend
// origin so browser requests do not accidentally go to the frontend host.
export const API_BASE_URL = configuredApiUrl && configuredApiUrl !== '/api'
  ? trimTrailingSlashes(configuredApiUrl)
  : configuredBackendUrl
    ? `${trimTrailingSlashes(configuredBackendUrl)}/api`
    : '/api';
