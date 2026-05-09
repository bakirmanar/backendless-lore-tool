import { ChangeDetectionStrategy, Component, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { BundleApi } from '../../api/bundle.api';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { StateImportExportService, StorageService } from '@app/services';
import { StorageKeys } from '@app/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-load-bundle',
  standalone: false,
  templateUrl: './load-bundle.page.html',
  styleUrl: './load-bundle.page.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadBundlePage implements OnInit {
  private readonly bundleApi = inject(BundleApi);
  private readonly storageService = inject(StorageService);
  private readonly stateImportExportService = inject(StateImportExportService);
  private readonly router: Router = inject(Router);

  private readonly status = signal<string>('LOADING');
  protected readonly statusDisplayValue = toSignal(
    toObservable(this.status).pipe(
      debounceTime(200),
    )
  )


  async ngOnInit() {
    try {
      const data = await this.bundleApi.getBundle();
      console.log(data);
      await this.storageService.set(StorageKeys.BUNDLE_DATA, data);
      this.status.set('PARSING');
      await this.stateImportExportService.importFromStorage();
      this.status.set('SUCCESS');
      this.router.navigate(['/'])
    } catch (error) {
      console.error(error);
      this.status.set('ERROR');
    }
  }
}
