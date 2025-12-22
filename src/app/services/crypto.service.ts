import { Injectable } from '@angular/core';
import { KeyCacheService } from './key-cache.service';

@Injectable({ providedIn: 'root' })
export class CryptoService {
  private enc = new TextEncoder();
  private dec = new TextDecoder();

  constructor(private readonly keyCacheService: KeyCacheService) {}

  private randBytes(n: number) {
    return crypto.getRandomValues(new Uint8Array(n));
  }

  async encrypt(pass: string, plaintext: string) {
    const salt = this.keyCacheService.getOrCreateSalt('dm');
    const iv = this.randBytes(12);
    const key = await this.keyCacheService.getOrDerive('dm', pass, salt);
    const ct = new Uint8Array(
      await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, this.enc.encode(plaintext))
    );
    const toB64 = (u8: Uint8Array) => btoa(String.fromCharCode(...u8));
    return { salt: toB64(salt), iv: toB64(iv), ct: toB64(ct) };
  }

  async decrypt(pass: string, bundle: { salt: string; iv: string; ct: string }) {
    const fromB64 = (b64: string) => Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const salt = fromB64(bundle.salt);
    const iv = fromB64(bundle.iv);
    const ct = fromB64(bundle.ct);
    const key = await this.keyCacheService.getOrDerive('dm', pass, salt);
    try {
      const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
      return this.dec.decode(pt);
    } catch {
      throw new Error('Bad passphrase');
    }
  }
}
