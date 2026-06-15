import { TestBed } from '@angular/core/testing';

import { HeaderWithAnchorExtension } from './header-with-anchor.extension';

describe('HeaderWithAnchorExtension', () => {
  let service: HeaderWithAnchorExtension;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeaderWithAnchorExtension);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
