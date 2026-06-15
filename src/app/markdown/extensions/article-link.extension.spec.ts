import { TestBed } from '@angular/core/testing';

import { ArticleLinkExtension } from './article-link.extension';

describe('ArticleLinkExtension', () => {
  let service: ArticleLinkExtension;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArticleLinkExtension);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
