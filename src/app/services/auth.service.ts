import { inject, Injectable } from '@angular/core';
import { StateImportExportService } from '@app/services/state-import-export.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly stateImportExportService = inject(StateImportExportService);

  async login(pass: string): Promise<void> {
    await this.stateImportExportService.importFromStorage(pass);
  }

  async logout() {
    await this.stateImportExportService.importFromStorage();
  }
}
