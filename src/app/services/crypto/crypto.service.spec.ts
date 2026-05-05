import { TestBed } from '@angular/core/testing';

import { BundleCryptoService } from './bundle-crypto.service';

describe('BundleCryptoService', () => {
  let service: BundleCryptoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BundleCryptoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
