import { inject, Injectable } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { map, Observable } from 'rxjs';
import {
  CompletionContext,
  CompletionMatch,
  CompletionOption,
  CompletionProvider,
} from '@app/models/completion.model';
import { StateService } from '@app/services';

@Injectable({ providedIn: 'root' })
export class ArticleCompletionProvider implements CompletionProvider {
  private readonly stateService = inject(StateService);
  private readonly articles$ = toObservable(this.stateService.articles);
  readonly id = 'article';

  match(context: CompletionContext): CompletionMatch | null {
    if (context.selectionStart !== context.selectionEnd) {
      return null;
    }

    const beforeCaret = context.text.slice(0, context.selectionStart);
    const result = /\[\[([^\[\]|\r\n]*)$/.exec(beforeCaret);
    return result
      ? { start: result.index, end: context.selectionStart, trigger: '[[', query: result[1] }
      : null;
  }

  search(query: string): Observable<readonly CompletionOption[]> {
    const normalizedQuery = query.trim().toLowerCase();
    return this.articles$.pipe(
      map((articles) =>
        articles
          .filter((article) => article.title.toLowerCase().includes(normalizedQuery))
          .map((article) => {
            const text = `[[${article.id}|]]`;
            const label = article.title || article.id;
            return { id: article.id, label, insertion: { text, caretOffset: text.length - 2 } };
          }),
      ),
    );
  }
}
