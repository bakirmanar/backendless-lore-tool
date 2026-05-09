import { AppState } from '@app/models/state.model';
import { EncryptedBundle } from '@app/models/encrypted-bundle.model';

export enum StorageKeys {
  BUNDLE_DATA = 'BUNDLE_DATA',
  APP_STATE = 'APP_STATE',
}

export type StorageKeyValueTypeMap = {
  [StorageKeys.BUNDLE_DATA]: EncryptedBundle,
  [StorageKeys.APP_STATE]: AppState,
}

export interface StorageAdapter {
  get<T extends keyof StorageKeyValueTypeMap>(key: T): Promise<StorageKeyValueTypeMap[T] | null>,
  set<T extends keyof StorageKeyValueTypeMap>(key: T, value: StorageKeyValueTypeMap[T]): Promise<void>,
  clear<T extends keyof StorageKeyValueTypeMap>(key: T): Promise<void>,
}
