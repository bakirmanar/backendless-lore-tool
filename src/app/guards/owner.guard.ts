import { inject, Injectable } from '@angular/core';
import { CanActivate, GuardResult, Router } from '@angular/router';
import { StateService } from '@app/services';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OwnerGuard implements CanActivate {
  private readonly stateService: StateService = inject(StateService);
  private readonly router: Router = inject(Router);

  canActivate(): Observable<GuardResult> {
    return this.stateService.initialized$.pipe(
      map(() => {
        if (this.stateService.authorizedAsOwner()) {
          return true;
        } else {
          return this.router.createUrlTree(['/']);
        }
      }),
    );
  }
}
