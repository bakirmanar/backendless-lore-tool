import { firstValueFrom } from 'rxjs';
import { Component, inject, Signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { KeyCacheService, StateService } from '@app/services';
import { PassphraseDialogComponent } from '@app/components/app-header/passphrase-dialog.component';
import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
})
export class AppHeaderComponent {
  readonly hasKey: Signal<boolean> = inject(KeyCacheService).hasKey;
  private readonly matDialogService = inject(MatDialog);
  private readonly authService = inject(AuthService);
  protected readonly stateService = inject(StateService);

  async openPassphraseDialog() {
    const ref = this.matDialogService.open(PassphraseDialogComponent, {width: '360px'});
    const pass = await firstValueFrom(ref.afterClosed());

    await this.authService.login(pass);

    // if (!pass) return;
    //
    // try {
    //   // Ensure app-level key is ready for new encryptions
    //   const appSalt = this.keyCache.getOrCreateSalt('dm');
    //   await this.keyCache.getOrDerive('dm', pass, appSalt);
    //
    //   // TODO is it needed?
    //   // TODO rethink how to validate it, because it might not work if bundle is decryptable by two keys (dm and player)
    //   // Validate passphrase by trying to decrypt one existing bundle if present
    //   const list = this.state.articles();
    //   let sampleEnc: { salt: string; iv: string; ct: string } | null = null;
    //   const saltsToPrepare = new Set<string>();
    //   for (const a of list) {
    //     for (const s of a.sections) {
    //       if (s.access === ContentAccess.PRIVATE && s.enc) {
    //         sampleEnc = sampleEnc ?? s.enc;
    //         saltsToPrepare.add(s.enc.salt);
    //       }
    //     }
    //   }
    //   if (sampleEnc) {
    //     await this.crypto.decrypt(pass, sampleEnc);
    //   }
    //   // Pre-derive keys for all salts seen so they can decrypt without further prompts
    //   for (const b64 of saltsToPrepare) {
    //     const saltBytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    //     await this.keyCache.getOrDerive('dm', pass, saltBytes);
    //   }
    // } catch (e) {
    //   alert('Failed to set passphrase');
    // }
  }

  clearPassphrase() {
    this.authService.logout();
  }
}
