import { Component, inject, Signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { KeyCacheService } from '@app/services';
import { StateService } from '@app/services';
import { CryptoService } from '@app/services';
import { LoreSectionAccess } from '@app/models';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
})
export class AppHeaderComponent {
  readonly hasKey: Signal<boolean> = inject(KeyCacheService).hasKey;
  private readonly keyCache = inject(KeyCacheService);
  private readonly dialog = inject(MatDialog);
  private readonly state = inject(StateService);
  private readonly crypto = inject(CryptoService);

  async openPassphraseDialog() {
    const { PassphraseDialogComponent } = await import('./passphrase-dialog.component');
    const ref = this.dialog.open(PassphraseDialogComponent, { width: '360px' });
    ref.afterClosed().subscribe(async (pass?: string) => {
      if (!pass) return;
      try {
        // Ensure app-level key is ready for new encryptions
        const appSalt = this.keyCache.getOrCreateSalt('dm');
        await this.keyCache.getOrDerive('dm', pass, appSalt);

        // Validate passphrase by trying to decrypt one existing bundle if present
        const list = this.state.articles();
        let sampleEnc: { salt: string; iv: string; ct: string } | null = null;
        const saltsToPrepare = new Set<string>();
        for (const a of list) {
          for (const s of a.sections) {
            if (s.access === LoreSectionAccess.PRIVATE && s.enc) {
              sampleEnc = sampleEnc ?? s.enc;
              saltsToPrepare.add(s.enc.salt);
            }
          }
        }
        if (sampleEnc) {
          await this.crypto.decrypt(pass, sampleEnc);
        }
        // Pre-derive keys for all salts seen so they can decrypt without further prompts
        for (const b64 of saltsToPrepare) {
          const saltBytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
          await this.keyCache.getOrDerive('dm', pass, saltBytes);
        }
      } catch (e) {
        alert('Failed to set passphrase');
      }
    });
  }

  clearPassphrase() {
    this.keyCache.clear('dm');
  }
}
