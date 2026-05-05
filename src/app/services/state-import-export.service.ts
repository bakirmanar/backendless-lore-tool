import { inject, Injectable } from '@angular/core';
import { StateService } from '@app/services/state.service';
import { EncryptedBundle } from '@app/models';
import { BundleCryptoService } from '@app/services/crypto/bundle-crypto.service';

@Injectable({
  providedIn: 'root',
})
export class StateImportExportService {
  private readonly stateService: StateService = inject(StateService);
  private readonly bundleCryptoService: BundleCryptoService = inject(BundleCryptoService);

  import() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      file.text().then(async (txt) => {
        try {
          // TODO password field?
          const parsedObj = JSON.parse(txt) as EncryptedBundle;
          const decryptedData = await this.bundleCryptoService.decrypt(parsedObj, 'dsa');
          if (decryptedData) {
            this.stateService.state = decryptedData;
          }
        } catch {
          alert('Invalid JSON snapshot.');
        }
      });
    };
    input.click();
  }

  async export() {
    if (!this.stateService.authorizedAsOwner()) return;

    const bundle = (await this.bundleCryptoService.encrypt(this.stateService.state))!;

    // TODO move to separate service
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lore-sheet.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
