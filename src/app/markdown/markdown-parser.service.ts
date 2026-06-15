import { inject, Injectable } from '@angular/core';
import * as DOMPurify from 'dompurify';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Article } from '@app/models';
import { Marked } from 'marked';
import { HeaderWithAnchorExtension } from './extensions/header-with-anchor.extension';
import { ArticleLinkExtension } from './extensions/article-link.extension';
import { MarkdownArticleStorageService } from './markdown-article-storage.service';
import { RenderContentsTableLink } from '@app/markdown/render-article.types';

@Injectable({
  providedIn: 'root',
})
export class MarkdownParserService {
  private readonly sanitizer: DomSanitizer = inject(DomSanitizer);
  private readonly headerWithAnchorExtension: HeaderWithAnchorExtension = inject(HeaderWithAnchorExtension);
  private readonly articleLinkExtension: ArticleLinkExtension = inject(ArticleLinkExtension);
  private readonly markdownArticleStorageService: MarkdownArticleStorageService = inject(MarkdownArticleStorageService);

  private readonly marked: Marked = new Marked({
    gfm: true,
    breaks: true,
    extensions: [
      this.headerWithAnchorExtension.buildMarkedConfiguration(),
      this.articleLinkExtension.buildMarkedConfiguration() as any
    ]
  });

  parseArticle(article: Article): [SafeHtml[], Iterable<RenderContentsTableLink>] | null {
    if (!article || !article.sections?.length) return null;

    this.markdownArticleStorageService.parsingStarted();
    const result = article.sections.map((section) => {
      const html = this.marked.parse(section.content) as string;
      const clean = DOMPurify.default().sanitize(html, { ADD_ATTR: ['target', 'rel'] }) as string;
      return this.sanitizer.bypassSecurityTrustHtml(clean);
    });
    const tableOfContentsArr = this.markdownArticleStorageService.currentArticleContents.values();
    this.markdownArticleStorageService.parsingEnded();

    return [result, tableOfContentsArr];
  }
}
