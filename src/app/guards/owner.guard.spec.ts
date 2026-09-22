import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { StateService } from '@app/services';
import { OwnerGuard } from './owner.guard';
import { firstValueFrom, ReplaySubject } from 'rxjs';

describe('OwnerGuard', () => {
  for (const owner of [true, false]) {
    it(owner ? 'allows the owner after state initialization' : 'redirects non-owners home', async () => {
      const initialized$ = new ReplaySubject<void>(1);
      const authorizedAsOwner = jasmine.createSpy('authorizedAsOwner').and.returnValue(owner);
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: StateService, useValue: {
            initialized$,
            authorizedAsOwner,
          } },
        ],
      });
      const result = firstValueFrom(TestBed.inject(OwnerGuard).canActivate());
      expect(authorizedAsOwner).not.toHaveBeenCalled();
      initialized$.next();
      initialized$.complete();
      const resolved = await result;
      if (owner) {
        expect(resolved).toBeTrue();
      } else {
        expect(resolved).toEqual(TestBed.inject(Router).createUrlTree(['/']));
      }
    });
  }
});
