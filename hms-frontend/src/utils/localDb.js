const DB_NAME = 'HMS_LocalDB';
const DB_VERSION = 1;

/**
 * Opens the connection to IndexedDB and handles schema initialization/upgrades.
 */
export function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Doctors store to cache consultation fee, specialization, and working hours
      if (!db.objectStoreNames.contains('doctors')) {
        db.createObjectStore('doctors', { keyPath: '_id' });
      }

      // Medicines store to cache names, unit prices, and stock quantities
      if (!db.objectStoreNames.contains('medicines')) {
        db.createObjectStore('medicines', { keyPath: '_id' });
      }

      // Patients store to cache patient profiles
      if (!db.objectStoreNames.contains('patients')) {
        db.createObjectStore('patients', { keyPath: '_id' });
      }

      // Offline Queue to track write operations pending sync
      if (!db.objectStoreNames.contains('offlineQueue')) {
        db.createObjectStore('offlineQueue', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

/**
 * Retrieves all items from a given object store.
 */
export async function getAll(storeName) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieves a single item by key.
 */
export async function getById(storeName, id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves or updates a single item.
 */
export async function putItem(storeName, item) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Bulk writes items into a store.
 */
export async function putItems(storeName, items) {
  if (!Array.isArray(items)) return;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    items.forEach((item) => {
      if (item && typeof item === 'object') {
        store.put(item);
      }
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Deletes a single item by key.
 */
export async function deleteItem(storeName, id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clears all entries from a store.
 */
export async function clearStore(storeName) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Local database service interface for clean exports.
 */
export const localDb = {
  // Raw IndexedDB methods
  putItem,
  deleteItem,

  // Doctors cache
  saveDoctors: (doctors) => putItems('doctors', doctors),
  getDoctors: () => getAll('doctors'),
  getDoctorById: (id) => getById('doctors', id),

  // Medicines cache
  saveMedicines: (medicines) => putItems('medicines', medicines),
  getMedicines: () => getAll('medicines'),
  getMedicineById: (id) => getById('medicines', id),

  // Patients cache
  savePatients: (patients) => putItems('patients', patients),
  getPatients: () => getAll('patients'),
  getPatientById: (id) => getById('patients', id),

  // Offline Queue
  addToQueue: (action) => putItem('offlineQueue', action),
  getQueue: () => getAll('offlineQueue'),
  removeFromQueue: (id) => deleteItem('offlineQueue', id),
  clearQueue: () => clearStore('offlineQueue'),
};

export default localDb;
