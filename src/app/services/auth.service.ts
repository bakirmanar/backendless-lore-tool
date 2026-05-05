import { Injectable } from '@angular/core';
import { StateService } from '@app/services/state.service';
import { KeyCacheService } from '@app/services/key-cache.service';
import { BundleCryptoService } from '@app/services/crypto/bundle-crypto.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  // FIXME to injectors
  constructor(
    private readonly stateService: StateService,
    private readonly keyCacheService: KeyCacheService,
    private readonly cryptoService: BundleCryptoService,
  ) {
  }

  async login(pass: string): Promise<boolean> {
    if (!pass) return false;

    try {
      // // Ensure app-level key is ready for new encryptions
      // // const appSalt = this.keyCacheService.getOrCreateSalt('dm');
      // await this.keyCacheService.getOrDerive(pass);
      //
      // // TODO is it needed?
      // // TODO rethink how to validate it, because it might not work if bundle is decryptable by two keys (dm and player)
      // // Validate passphrase by trying to decrypt one existing bundle if present
      // const list = this.stateService.articles();
      // let sampleEnc: { salt: string; iv: string; ct: string } | null = null;
      // const saltsToPrepare = new Set<string>();
      // for (const a of list) {
      //   for (const s of a.sections!) {
      //     if (s.accessTags === ContentAccess.PRIVATE && !s.decrypted && s.enc) {
      //       sampleEnc = sampleEnc ?? s.enc;
      //       saltsToPrepare.add(s.enc.salt);
      //     }
      //   }
      // }
      // if (sampleEnc) {
      //   await this.cryptoService.decrypt(pass, sampleEnc);
      // }
      // // Pre-derive keys for all salts seen so they can decrypt without further prompts
      // for (const b64 of saltsToPrepare) {
      //   const saltBytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      //   // TODO derive only method
      //   // await this.keyCacheService.getOrDerive('dm', pass, saltBytes);
      // }
      return true;
    } catch (e) {
      alert('Failed to set passphrase');
      return false;
    }
  }

  logout() {
    this.keyCacheService.clear('dm');
    // this.stateService.hasKey.set(false);
  }
}
