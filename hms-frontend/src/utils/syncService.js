import api from '../api/client';
import localDb from './localDb';

let isSyncing = false;
let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
const statusListeners = new Set();

/**
 * Registers a callback to receive status updates when connectivity or sync states change.
 */
export function addStatusListener(callback) {
  statusListeners.add(callback);
  callback({ isOnline, isSyncing });
  return () => statusListeners.delete(callback);
}

function notifyStatusChange() {
  statusListeners.forEach((cb) => cb({ isOnline, isSyncing }));
}

/**
 * Dispatches a custom event 'hms-toast' to trigger UI toast notifications.
 */
export function triggerToast(message, type = 'info') {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('hms-toast', { detail: { message, type } });
    window.dispatchEvent(event);
  }
}

/**
 * Synchronizes the local offline queue with the backend, handling successes and conflicts.
 */
export async function syncOfflineQueue() {
  if (isSyncing) return;
  if (!navigator.onLine) {
    isOnline = false;
    notifyStatusChange();
    return;
  }

  isSyncing = true;
  notifyStatusChange();

  try {
    const queue = await localDb.getQueue();
    if (queue.length === 0) {
      isSyncing = false;
      notifyStatusChange();
      return;
    }

    triggerToast(`Restored connection. Syncing ${queue.length} pending offline action(s)...`, 'info');

    // Process actions in chronological order
    for (const item of queue) {
      // Check network status during processing loop
      if (!navigator.onLine) {
        isOnline = false;
        triggerToast('Network connection lost. Sync suspended.', 'warning');
        break;
      }

      try {
        // Send request bypassing the interceptor (using direct client method requestDirect)
        const response = await api.requestDirect(item.method, item.url, item.body);

        // Success: remove from local offlineQueue
        await localDb.removeFromQueue(item.id);

        // If the resource was newly created and has a backend ID, swap out the temporary cached record
        if (response && response._id && item.tempId) {
          if (item.action === 'Create Patient' || item.action === 'Register') {
            await localDb.deleteItem('patients', item.tempId);
            await localDb.putItem('patients', response);
          } else if (item.action === 'Create Staff' && item.body?.role === 'doctor') {
            await localDb.deleteItem('doctors', item.tempId);
            await localDb.putItem('doctors', response);
          } else if (item.action === 'Add Medicine') {
            await localDb.deleteItem('medicines', item.tempId);
            await localDb.putItem('medicines', response);
          }
        }

        triggerToast(`Successfully synced: "${item.action}"`, 'success');
      } catch (err) {
        console.error('Failed to sync offline item:', item, err);

        // Check for duplicate booking errors or conflicts
        const isDuplicateBooking =
          err.status === 409 ||
          (err.status === 400 && err.message?.toLowerCase().includes('already taken')) ||
          (err.status === 400 && err.message?.toLowerCase().includes('already booked')) ||
          err.message?.toLowerCase().includes('duplicate') ||
          err.message?.toLowerCase().includes('slot no longer available');

        if (isDuplicateBooking) {
          // Notify the user about the validation conflict, and discard the queue item to prevent blockage
          const reason = err.message || 'Duplicate resource or slot already taken';
          triggerToast(`Sync conflict: ${reason}. "${item.action}" discarded.`, 'error');
          await localDb.removeFromQueue(item.id);
        } else {
          // Transient network/server error: suspend syncing for now and retry later
          triggerToast(`Sync paused: ${err.message || 'Server error'}. Retrying when connection stabilizes.`, 'warning');
          break;
        }
      }
    }
  } catch (error) {
    console.error('Error during synchronization execution:', error);
  } finally {
    isSyncing = false;
    isOnline = navigator.onLine;
    notifyStatusChange();
  }
}

/**
 * Initializes listeners for online/offline events.
 * Returns a cleanup function to remove listeners.
 */
export function initSync() {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => {
    isOnline = true;
    notifyStatusChange();
    syncOfflineQueue();
  };

  const handleOffline = () => {
    isOnline = false;
    notifyStatusChange();
    triggerToast('Offline mode activated. Pending write operations will be queued locally.', 'warning');
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Run startup sync check
  if (navigator.onLine) {
    syncOfflineQueue();
  }

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
