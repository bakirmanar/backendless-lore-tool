import { Injectable, Signal, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class KeyCacheService {
  private readonly cache = new Map<string, CryptoKey>(); // key by `${label}:${saltB64}`
  private readonly _hasKey = signal<boolean>(false);
  readonly hasKey: Signal<boolean> = computed(() => this._hasKey());

  private readonly KEY_PREFIX = 'key:'; // sessionStorage key prefix: key:<label>:<saltB64>
  private readonly SALT_PREFIX = 'salt:'; // localStorage salt per label

  constructor() {
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (!k || !k.startsWith(this.KEY_PREFIX)) continue;
      const rawB64 = sessionStorage.getItem(k);
      if (!rawB64) continue;
      try {
        const raw = this.base64ToBytes(rawB64);
        const rawBuf = this.u8ToArrayBuffer(raw);
        crypto.subtle
          .importKey('raw', rawBuf, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
          .then(key => {
            this.cache.set(k.substring(this.KEY_PREFIX.length), key);
            this._hasKey.set(this.cache.size > 0);
          })
          .catch(() => {/* ignore bad entries */});
      } catch {/* ignore */}
    }
  }

  async getOrDerive(label: string, pass: string, salt: Uint8Array): Promise<CryptoKey> {
    const saltB64 = this.bytesToBase64(salt);
    const cacheKey = `${label}:${saltB64}`;
    const existing = this.cache.get(cacheKey);
    if (existing) return existing;
    if (!pass) throw new Error('Passphrase required');
    const passKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(pass),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    const saltBuf = this.u8ToArrayBuffer(salt);
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: saltBuf, iterations: 120000, hash: 'SHA-256' },
      passKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    this.cache.set(cacheKey, key);
    this._hasKey.set(this.cache.size > 0);
    try {
      const raw = new Uint8Array(await crypto.subtle.exportKey('raw', key));
      sessionStorage.setItem(this.KEY_PREFIX + cacheKey, this.bytesToBase64(raw));
    } catch {}
    return key;
  }

  clear(label?: string) {
    if (!label) {
      this.cache.clear();
      // remove all entries
      const keys: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith(this.KEY_PREFIX)) keys.push(k);
      }
      keys.forEach(k => sessionStorage.removeItem(k));
    } else {
      // remove entries for this label
      const toDelete: string[] = [];
      for (const k of this.cache.keys()) {
        if (k.startsWith(label + ':')) toDelete.push(k);
      }
      toDelete.forEach(k => this.cache.delete(k));
      const ssKeys: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith(this.KEY_PREFIX + label + ':')) ssKeys.push(k);
      }
      ssKeys.forEach(k => sessionStorage.removeItem(k));
    }
    this._hasKey.set(this.cache.size > 0);
  }

  getOrCreateSalt(label: string): Uint8Array {
    const key = this.SALT_PREFIX + label;
    const existing = localStorage.getItem(key);
    if (existing) return this.base64ToBytes(existing);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    localStorage.setItem(key, this.bytesToBase64(salt));
    return salt;
  }

  private bytesToBase64(u8: Uint8Array): string {
    let bin = '';
    for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
    return btoa(bin);
  }

  private base64ToBytes(b64: string): Uint8Array {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  private u8ToArrayBuffer(u8: Uint8Array): ArrayBuffer {
    const ab = new ArrayBuffer(u8.byteLength);
    new Uint8Array(ab).set(u8);
    return ab;
  }
}
