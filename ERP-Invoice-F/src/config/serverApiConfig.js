const rawServer = import.meta.env.VITE_BACKEND_SERVER || 'http://localhost:8888/';
const serverUrl = rawServer.endsWith('/') ? rawServer : rawServer + '/';

export const API_BASE_URL =
  import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE == 'remote'
    ? serverUrl + 'api/'
    : 'http://localhost:8888/api/';
export const BASE_URL =
  import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE
    ? serverUrl
    : 'http://localhost:8888/';

export const WEBSITE_URL = import.meta.env.PROD
  ? 'http://localhost:3000/'
  : 'http://localhost:3000/';
export const DOWNLOAD_BASE_URL =
  import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE
    ? serverUrl + 'download/'
    : 'http://localhost:8888/download/';
export const ACCESS_TOKEN_NAME = 'x-auth-token';

export const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL;
