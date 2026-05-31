// IndexedDB utility for storing video wishes locally so they persist across page reloads

export interface Wish {
  id: string;
  sender: string;
  relation: string;
  greeting: string;
  timestamp: number;
  videoBlob: Blob | null;
  videoUrl?: string; // Generated at runtime from the Blob
}

const DB_NAME = 'BirthdayWishesDB';
const DB_VERSION = 1;
const STORE_NAME = 'wishes';

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function saveWish(wish: Wish): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(wish);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getWishes(): Promise<Wish[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const wishes = request.result as Wish[];
      // Sort by timestamp descending
      wishes.sort((a, b) => b.timestamp - a.timestamp);
      resolve(wishes);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteWish(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function saveFeaturedVideo(blob: Blob): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id: 'featured-video', videoBlob: blob, sender: 'System', relation: 'System', greeting: '', timestamp: Date.now() });
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getFeaturedVideo(): Promise<Blob | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('featured-video');
    
    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.videoBlob : null);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteFeaturedVideo(): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete('featured-video');

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
