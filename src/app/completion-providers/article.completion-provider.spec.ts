import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Article, CompletionOption } from '@app/models';
import { StateService } from '@app/services';
import { ArticleCompletionProvider } from '@app/completion-providers';

describe('ArticleCompletionProvider', () => {
  const articles = signal<Article[]>([]);
  let provider: ArticleCompletionProvider;
  beforeEach(() => {
    articles.set([
      { id: '123', title: 'Old World', accessTags: [], sections: [] },
      { id: '456', title: 'New World', accessTags: [], sections: [] },
    ]);
    TestBed.configureTestingModule({
      providers: [{ provide: StateService, useValue: { articles } }],
    });
    provider = TestBed.inject(ArticleCompletionProvider);
  });

  it('matches queries containing spaces and rejects completed or multiline syntax', () => {
    const text = 'See [[Old World';
    expect(
      provider.match({ text, selectionStart: text.length, selectionEnd: text.length }),
    ).toEqual({ start: 4, end: text.length, trigger: '[[', query: 'Old World' });
    for (const text of ['[[123|', '[[123]]', '[[Old\nWorld']) {
      expect(
        provider.match({ text, selectionStart: text.length, selectionEnd: text.length }),
      ).toBeNull();
    }
    expect(provider.match({ text: '[[', selectionStart: 0, selectionEnd: 2 })).toBeNull();
  });

  it('filters case insensitively and emits current article state with exact insertion offsets', () => {
    let result: readonly CompletionOption[] = [];
    const subscription = provider.search('OLD').subscribe((options) => (result = options));
    TestBed.tick();
    expect(result).toEqual([
      { id: '123', label: 'Old World', insertion: { text: '[[123|]]', caretOffset: 6 } },
    ]);
    articles.set([]);
    TestBed.tick();
    expect(result).toEqual([]);
    subscription.unsubscribe();
  });
});
