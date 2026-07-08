import { API_BASE_URL } from '../utils/constants';
import localDb from '../utils/localDb';

/**
 * Safe environment utility to check if the app is running in the Electron desktop context.
 */
export const isElectron = typeof window !== 'undefined' && 
  (!!window.hmsDesktop?.isElectron || (window.navigator && window.navigator.userAgent.includes('Electron')));

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

/**
 * Directly submits a request to the backend bypassing offline interception.
 * Used exclusively by the sync engine.
 */
async function requestDirect(method, path, body = null) {
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

/**
 * Handle API calls offline by fetching from IndexedDB caches or queuing write actions.
 */
async function handleOfflineInterception(method, path, body) {
  console.log(`[Offline Intercept] ${method} ${path}`, body);

  if (method === 'GET') {
    // 1. Doctors list
    if (path === '/users/doctors') {
      const cached = await localDb.getDoctors();
      return cached;
    }

    // 2. Medicines list/detail
    if (path.startsWith('/medicines')) {
      const pathNoQuery = path.split('?')[0];
      const parts = pathNoQuery.split('/');
      const id = parts[2];

      if (id && id !== '' && !id.includes('?')) {
        const item = await localDb.getMedicineById(id);
        if (item) return item;
        throw new Error('Medicine not found in offline cache');
      }

      const cached = await localDb.getMedicines();
      const params = new URLSearchParams(path.split('?')[1]);
      const search = params.get('search')?.toLowerCase() || '';
      const lowStock = params.get('lowStock') === 'true';

      let filtered = cached;
      if (lowStock) {
        filtered = filtered.filter(m => m.stockQty < 10);
      }
      if (search) {
        filtered = filtered.filter(m => m.name.toLowerCase().includes(search));
      }
      return { data: filtered, total: filtered.length };
    }

    // 3. Patients list/detail
    if (path.startsWith('/users')) {
      const pathNoQuery = path.split('?')[0];
      const parts = pathNoQuery.split('/');
      const id = parts[2];

      if (id && id !== '' && !id.includes('?')) {
        const item = await localDb.getDoctorById(id) || await localDb.getPatientById(id);
        if (item) return item;
        throw new Error('Patient not found in offline cache');
      }

      const cached = await localDb.getPatients();
      const params = new URLSearchParams(path.split('?')[1]);
      const search = params.get('search')?.toLowerCase() || '';

      let filtered = cached;
      if (search) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(search) || p.email?.toLowerCase().includes(search));
      }
      return { data: filtered, total: filtered.length };
    }

    throw new Error('You are currently offline. Requested data is not cached.');
  }

  // Intercept Writes: POST, PATCH, DELETE
  const tempId = 'temp_' + Date.now();
  let actionName = 'Offline Operation';

  if (method === 'POST') {
    if (path.startsWith('/appointments')) actionName = 'Book Appointment';
    else if (path.startsWith('/prescriptions')) actionName = 'Create Prescription';
    else if (path.startsWith('/billing')) actionName = 'Create Bill';
    else if (path.startsWith('/auth/register') || path.startsWith('/users')) actionName = 'Create Patient';
    else if (path.startsWith('/auth/staff')) actionName = 'Create Staff';
    else if (path.startsWith('/medicines')) actionName = 'Add Medicine';
  } else if (method === 'PATCH') {
    if (path.startsWith('/medicines')) actionName = 'Update Medicine';
    else if (path.startsWith('/appointments')) actionName = 'Update Appointment';
    else if (path.startsWith('/users')) actionName = 'Update User';
  } else if (method === 'DELETE') {
    if (path.startsWith('/medicines')) actionName = 'Delete Medicine';
    else if (path.startsWith('/users')) actionName = 'Delete User';
  }

  // Add write action to local IndexedDB offlineQueue
  await localDb.addToQueue({
    action: actionName,
    url: path,
    method,
    body: body ? { ...body } : null,
    timestamp: Date.now(),
    tempId
  });

  // Update local IndexedDB cache store so that offline GET results are reactive
  if (method === 'POST') {
    if (actionName === 'Create Patient') {
      await localDb.putItem('patients', { _id: tempId, role: 'patient', isActive: true, ...body });
    } else if (actionName === 'Create Staff' && body?.role === 'doctor') {
      await localDb.putItem('doctors', { _id: tempId, isActive: true, ...body });
    } else if (actionName === 'Add Medicine') {
      await localDb.putItem('medicines', { _id: tempId, isActive: true, ...body });
    }
  } else if (method === 'PATCH') {
    const parts = path.split('/');
    const id = parts[2];
    if (id) {
      if (path.startsWith('/medicines')) {
        const existing = await localDb.getMedicineById(id);
        if (existing) {
          let updated = { ...existing };
          if (path.includes('adjust-stock')) {
            updated.stockQty = Math.max(0, updated.stockQty + (body.qtyChange || 0));
          } else {
            updated = { ...updated, ...body };
          }
          await localDb.putItem('medicines', updated);
        }
      } else if (path.startsWith('/users')) {
        const existing = await localDb.getPatientById(id) || await localDb.getDoctorById(id);
        if (existing) {
          const updated = { ...existing, ...body };
          if (existing.role === 'patient') {
            await localDb.putItem('patients', updated);
          } else {
            await localDb.putItem('doctors', updated);
          }
        }
      }
    }
  } else if (method === 'DELETE') {
    const parts = path.split('/');
    const id = parts[2];
    if (id) {
      if (path.startsWith('/medicines')) {
        await localDb.deleteItem('medicines', id);
      } else if (path.startsWith('/users')) {
        await localDb.deleteItem('patients', id);
      }
    }
  }

  // Trigger offline notification via custom event
  const { triggerToast } = await import('../utils/syncService');
  triggerToast(`Offline Mode: Action "${actionName}" has been queued.`, 'warning');

  // Return simulated success response
  return {
    _id: tempId,
    id: tempId,
    success: true,
    ...(body || {}),
    createdAt: new Date().toISOString()
  };
}

async function request(method, path, body = null, retried = false) {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // Intercept right away if the browser reports offline status
  if (!isOnline) {
    return handleOfflineInterception(method, path, body);
  }

  try {
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

    // Auto-refresh on 401 Unauthorized
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

    // Cache seeding: update local stores with fresh listings from the backend when online
    if (method === 'GET') {
      try {
        if (path === '/users/doctors') {
          const docsList = data.data || data;
          if (Array.isArray(docsList)) {
            await localDb.saveDoctors(docsList);
          }
        } else if (path.startsWith('/medicines')) {
          const pathNoQuery = path.split('?')[0];
          const parts = pathNoQuery.split('/');
          if (parts.length <= 2) { // just /medicines
            const medsList = data.data || data;
            if (Array.isArray(medsList)) {
              await localDb.saveMedicines(medsList);
            }
          }
        } else if (path.startsWith('/users')) {
          const queryParams = new URLSearchParams(path.split('?')[1]);
          if (queryParams.get('role') === 'patient') {
            const patsList = data.data || data;
            if (Array.isArray(patsList)) {
              await localDb.savePatients(patsList);
            }
          }
        }
      } catch (cacheErr) {
        console.warn('Failed to update local IndexedDB cache', cacheErr);
      }
    }

    return data;
  } catch (fetchError) {
    // If we throw a network fetch failure, gracefully fall back to offline interception
    const isNetworkError = fetchError instanceof TypeError || 
      fetchError.message?.includes('Failed to fetch') || 
      fetchError.message?.includes('NetworkError');

    if (isNetworkError) {
      console.warn('Network request failed. Falling back to offline fallback mode.', fetchError);
      return handleOfflineInterception(method, path, body);
    }
    throw fetchError;
  }
}

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
  requestDirect,
  setTokens,
  clearTokens,
  getTokens,
};

export default api;
