import { TestBed } from '@angular/core/testing';

import { BundleApi } from './bundle.api';

describe('BundleApi', () => {
  let service: BundleApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BundleApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
