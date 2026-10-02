import { inject, Injectable } from '@angular/core';
import { FileService, StateService, StorageService } from '@app/services';
import { EncryptedBundle, FileType, StorageKeys } from '@app/models';
import { BundleCryptoService } from '@app/crypto';
import { encryptedBundleToAppState } from '@app/transformers';

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

    if (passphrase) {
      const decryptedData = await this.bundleCryptoService.decrypt(bundle, passphrase);
      if (decryptedData) {
        this.stateService.state = decryptedData;
        return;
      }
    }

    this.stateService.state = encryptedBundleToAppState(bundle);
  }

  async importFromLocalFile() {
    try {
      // TODO password field?
      const fileContents = await this.fileService.readLocalFile(FileType.JSON);
      const bundle = JSON.parse(fileContents ?? '') as EncryptedBundle;
      const appState = encryptedBundleToAppState(bundle);

      if (appState) {
        this.storageService.set(StorageKeys.BUNDLE_DATA, bundle);
        this.stateService.state = appState;
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
