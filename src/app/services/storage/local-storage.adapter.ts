import { StorageKeyValueTypeMap } from '@app/models';

const PREFIX = 'APP:';

export class LocalStorageAdapter {
  static async get<T extends keyof StorageKeyValueTypeMap>(key: T): Promise<StorageKeyValueTypeMap[T] | null> {
    const data = localStorage.getItem(`${PREFIX}:${key}`);

    return data ? JSON.parse(data) : null;
  }

  static async set<T extends keyof StorageKeyValueTypeMap>(key: T, value: StorageKeyValueTypeMap[T]): Promise<void> {
    localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify(value));
  }

  static async clear<T extends keyof StorageKeyValueTypeMap>(key: T): Promise<void> {
    localStorage.removeItem(`${PREFIX}:${key}`);
  }
}
