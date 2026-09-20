import { firstValueFrom } from 'rxjs';
import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService, StateImportExportService, StateService } from '@app/services';
import { PassphraseDialogComponent } from '@app/components';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppHeaderComponent {
  private readonly matDialogService = inject(MatDialog);
  private readonly authService = inject(AuthService);
  protected readonly stateService = inject(StateService);
  private readonly stateImportExportService: StateImportExportService = inject(StateImportExportService);

  async openPassphraseDialog() {
    const ref = this.matDialogService.open(PassphraseDialogComponent, {width: '360px'});
    const pass = await firstValueFrom(ref.afterClosed());

    await this.authService.login(pass);
  }

  clearPassphrase() {
    this.authService.logout();
  }

  exportJSON() {
    this.stateImportExportService.export();
  }

  importJSON() {
    this.stateImportExportService.importFromLocalFile();
  }
}
