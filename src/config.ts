// Tech design §1: the API runs on port 3000 locally; other environments set VITE_API_BASE_URL.
const DEFAULT_API_BASE_URL = 'http://localhost:3000';

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
