import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Marked } from 'marked';
import { StateService } from '@app/services';
import { ArticleLinkExtension } from './article-link.extension';

describe('ArticleLinkExtension', () => {
  it('renders a link with an empty label using the article title', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: StateService, useValue: {
        articles: signal([{ id: '123', title: 'First article' }]),
      } }],
    });
    const extension = TestBed.inject(ArticleLinkExtension).buildMarkedConfiguration();
    const parser = new Marked({ extensions: [extension] });
    expect(parser.parseInline('[[123|]]')).toBe(
      '<a href="/article/123" class="article-link">First article</a>',
    );
  });
});

