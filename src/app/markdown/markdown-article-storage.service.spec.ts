import { TestBed } from '@angular/core/testing';

import { MarkdownArticleStorageService } from './markdown-article-storage.service';

describe('MarkdownArticleStorageService', () => {
  let service: MarkdownArticleStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarkdownArticleStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
