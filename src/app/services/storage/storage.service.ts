import { Injectable } from '@angular/core';
import { AppState, Article, StorageAdapter, StorageKeys, StorageKeyValueTypeMap } from 'src/app/models';
import { LocalStorageAdapter } from '@app/services/storage/local-storage.adapter';
import { IndexedDbAdapter } from '@app/services/storage/indexed-db.adapter';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly adapter: StorageAdapter;

  constructor() {
    this.adapter = IndexedDbAdapter.isSupported() ? IndexedDbAdapter : LocalStorageAdapter;
  }

  async load(): Promise<AppState | null> {
    return this.adapter.get(StorageKeys.APP_STATE);
  }

  async get<T extends keyof StorageKeyValueTypeMap>(key: T): Promise<StorageKeyValueTypeMap[T] | null> {
    return this.adapter.get(key);
  }

  async set<T extends keyof StorageKeyValueTypeMap>(key: T, value: StorageKeyValueTypeMap[T]): Promise<void> {
    return this.adapter.set(key, value);
  }

  async clear(key: keyof StorageKeyValueTypeMap): Promise<void> {
    return this.adapter.clear(key)
  }
}
