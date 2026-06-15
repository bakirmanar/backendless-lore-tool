import { inject, Injectable } from '@angular/core';
import { Token } from 'marked';
import { StateService } from '@app/services';

@Injectable({
  providedIn: 'root',
})
export class ArticleLinkExtension {
  private readonly stateService: StateService = inject(StateService);

  buildMarkedConfiguration() {
    // TODO check if this being build on each render?
    const buildIndex = () => {
      const articles = this.stateService.articles();
      const byId = new Map<string, { id: string; title: string }>();
      const byTitle = new Map<string, { id: string; title: string }>();
      for (const a of articles) {
        byId.set(a.id, { id: a.id, title: a.title! });
        byTitle.set((a.title || '').trim().toLowerCase(), { id: a.id, title: a.title! });
      }
      return { byId, byTitle };
    };

    type ArticleLinkToken = Token & { type: 'articleLink'; raw: string; target: string; label?: string };

    return {
      name: 'articleLink',
      level: 'inline' as const,
      start(src: string) { return src.indexOf('[['); },
      tokenizer(this: any, src: string) {
        const rule = /^\[\[([^\]|]+?)(?:\|([^\]]+))?]]/;
        const match = rule.exec(src);
        if (match) {
          const token: ArticleLinkToken = {
            type: 'articleLink',
            raw: match[0],
            target: match[1].trim(),
            label: (match[2] || '').trim(),
          } as any;
          return token;
        }
        return null
      },
      renderer: (token: ArticleLinkToken) => {
        const { byId, byTitle } = buildIndex();
        const t = token.target;
        const byExactId = byId.get(t);
        const byExactTitle = byTitle.get(t.trim().toLowerCase());
        const hit = byExactId || byExactTitle;
        const text = token.label && token.label.length ? token.label : (hit?.title ?? t);
        if (!hit) {
          return `<span class="missing-article">${text}</span>`;
        }
        const href = `/article/${hit.id}`;
        return `<a href="${href}" class="article-link">${text}</a>`;
      },
    };
  }
}
