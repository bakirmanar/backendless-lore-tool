import { StorageKeyValueTypeMap } from '@app/models';

export class IndexedDbAdapter {
  private static readonly DB_NAME = 'app-storage';
  private static readonly DB_VERSION = 1;
  private static readonly STORE_NAME = 'key-value-store';

  private static dbPromise: Promise<IDBDatabase> | null = null;

  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  private static getDb(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };
    });

    return this.dbPromise;
  }

  static async get<T extends keyof StorageKeyValueTypeMap>(key: T): Promise<StorageKeyValueTypeMap[T] | null> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.STORE_NAME, 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(key);

      request.onerror = () => {
        console.error(request.error);
        resolve(null);
      };

      request.onsuccess = () => {
        resolve(request.result ?? null);
      };
    });
  }

  static async set<T extends keyof StorageKeyValueTypeMap>(key: T, value: StorageKeyValueTypeMap[T]): Promise<void> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put(value, key);

      request.onerror = () => {
        console.error(request.error);
        resolve();
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  static async clear<T extends keyof StorageKeyValueTypeMap>(key: T): Promise<void> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(key);

      request.onerror = () => {
        console.error(request.error);
        resolve();
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }
}
