import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  GuardResult,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { StorageService } from '@app/services';
import { StorageKeys } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class HasBundleGuard implements CanActivate {
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<GuardResult> {
    const bundle = await this.storageService.get(StorageKeys.BUNDLE_DATA);

    return bundle ? true : this.router.createUrlTree(['/loadBundle']);
  }
}
