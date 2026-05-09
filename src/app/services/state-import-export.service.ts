import { inject, Injectable } from '@angular/core';
import { StateService } from '@app/services/state.service';
import { EncryptedBundle, FileType, StorageKeys } from '@app/models';
import { BundleCryptoService } from '@app/services/crypto/bundle-crypto.service';
import { FileService } from '@app/services/file.service';
import { StorageService } from '@app/services/storage/storage.service';
import { encryptedBundleToAppState } from '../transformers';

@Injectable({
  providedIn: 'root',
})
export class StateImportExportService {
  private readonly stateService: StateService = inject(StateService);
  private readonly bundleCryptoService: BundleCryptoService = inject(BundleCryptoService);
  private readonly fileService: FileService = inject(FileService);
  private readonly storageService: StorageService = inject(StorageService);

  async importFromStorage(passphrase?: string) {
    const bundle = await this.storageService.get(StorageKeys.BUNDLE_DATA);

    if (!bundle) {
      return;
    }

    if (!passphrase) {
      this.stateService.state = encryptedBundleToAppState(bundle);
    } else {
      const decryptedData = await this.bundleCryptoService.decrypt(bundle, passphrase );
      if (decryptedData) {
        this.stateService.state = decryptedData;
      }
    }
  }

  async importFromLocalFile() {
    try {
      // TODO password field?
      const fileContents = await this.fileService.readLocalFile(FileType.JSON);
      const parsedObj = JSON.parse(fileContents ?? '') as EncryptedBundle;
      const decryptedData = await this.bundleCryptoService.decrypt(parsedObj, 'dsa');
      if (decryptedData) {
        this.stateService.state = decryptedData;
      }
    } catch {
      alert('Invalid JSON snapshot.');
    }
  }

  async export(): Promise<void> {
    if (!this.stateService.authorizedAsOwner()) return;

    const bundle = (await this.bundleCryptoService.encrypt(this.stateService.state))!;

    this.fileService.downloadFile(bundle, 'lore-sheet', FileType.JSON);
  }
}
