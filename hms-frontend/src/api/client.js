import { API_BASE_URL } from '../utils/constants';

function getTokens() {
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    userId: localStorage.getItem('userId'),
  };
}

function setTokens(accessToken, refreshToken, userId) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  if (userId) localStorage.setItem('userId', userId);
}

function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('user');
}

async function refreshAccessToken() {
  const { refreshToken, userId } = getTokens();
  if (!refreshToken || !userId) {
    clearTokens();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  const data = await res.json();
  setTokens(data.accessToken, data.refreshToken, data.user?.id);
  return data.accessToken;
}

async function request(method, path, body = null, retried = false) {
  const { accessToken } = getTokens();
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const options = { method, headers };
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, options);

  // Auto-refresh on 401
  if (res.status === 401 && !retried && accessToken) {
    try {
      await refreshAccessToken();
      return request(method, path, body, true);
    } catch {
      throw new Error('Session expired');
    }
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMessage = data?.message || `Request failed with status ${res.status}`;
    const error = new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
  setTokens,
  clearTokens,
  getTokens,
};

export default api;
