import { TestBed } from '@angular/core/testing';

import { HasBundleGuard } from './has-bundle.guard';

describe('HasBundleGuard', () => {
  let guard: HasBundleGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(HasBundleGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
