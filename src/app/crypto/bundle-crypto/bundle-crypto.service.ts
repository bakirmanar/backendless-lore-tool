import { Injectable } from '@angular/core';
import { AppState, EncryptedBundle } from '@app/models';
import { BundleEncryptService } from './bundle-encrypt.service';
import { BundleDecryptService } from './bundle-decrypt.service';

@Injectable({ providedIn: 'root' })
export class BundleCryptoService {
  async encrypt(state: AppState): Promise<EncryptedBundle | null> {
    return BundleEncryptService.encrypt(state);
  }

  async decrypt(bundle: EncryptedBundle, password: string): Promise<AppState | null> {
    return BundleDecryptService.decrypt(bundle, password);
  }
}
