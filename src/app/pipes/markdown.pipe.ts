import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked, Token } from 'marked';
import * as DOMPurify from 'dompurify';
import { StateService } from '@app/services';

// Global base options (renderer configured in setup)
marked.setOptions({ gfm: true, breaks: true });

@Pipe({
  name: 'markdown',
  standalone: false,
})
export class MarkdownPipe implements PipeTransform {
  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly state: StateService,
  ) {
    this.setupMarkdownExtensions();
  }

  private setupMarkdownExtensions() {
    // TODO check if this being build on each render?
    const buildIndex = () => {
      const articles = this.state.articles();
      const byId = new Map<string, { id: string; title: string }>();
      const byTitle = new Map<string, { id: string; title: string }>();
      for (const a of articles) {
        byId.set(a.id, { id: a.id, title: a.title! });
        byTitle.set((a.title || '').trim().toLowerCase(), { id: a.id, title: a.title! });
      }
      return { byId, byTitle };
    };

    const renderer = new marked.Renderer();
    renderer.link = ({ href, title, text }) => {
      const t = title ? ` title="${title}"` : '';
      const url = href ?? '';
      const isInternal = url.startsWith('/') || url.startsWith('#');
      const extra = isInternal ? '' : ' target="_blank" rel="noopener noreferrer"';
      return `<a href="${url}"${t}${extra}>${text}</a>`;
    };

    type ArticleLinkToken = Token & { type: 'articleLink'; raw: string; target: string; label?: string };
    const articleLinkExt = {
      name: 'articleLink',
      level: 'inline' as const,
      start(src: string) { return src.indexOf('[['); },
      tokenizer(this: any, src: string) {
        const rule = /^\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/;
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

    marked.setOptions({ renderer });
    marked.use({ extensions: [articleLinkExt as any], renderer });
  }

  transform(src?: string | null): SafeHtml {
    if (!src) return this.sanitizer.bypassSecurityTrustHtml('');
    const html = marked.parse(src) as string;
    const clean = DOMPurify.default().sanitize(html, { ADD_ATTR: ['target', 'rel'] }) as string;
    return this.sanitizer.bypassSecurityTrustHtml(clean);
  }
}

