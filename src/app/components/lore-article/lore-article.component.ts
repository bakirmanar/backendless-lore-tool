import { Component, computed, inject, input } from '@angular/core';
import { Article, ArticleSection } from '@app/models';
import { MarkdownParserService, RenderContentsTableLink } from '@app/markdown';
import { SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';


@Component({
  selector: 'app-lore-article',
  standalone: false,
  templateUrl: './lore-article.component.html',
  styleUrls: ['./lore-article.component.scss'],
})
export class LoreArticleComponent {
  protected readonly markdownParserService: MarkdownParserService = inject(MarkdownParserService);
  protected readonly router: Router = inject(Router);

  public readonly article = input.required<Article>();
  protected readonly articleParseResults = computed<[SafeHtml[], Iterable<RenderContentsTableLink>] | null>(() => {
    const article = this.article();
    return this.markdownParserService.parseArticle(article);
  })
  protected readonly articleHtml = computed<{ section: ArticleSection, html: SafeHtml }[]>(() => {
    const article = this.article();
    const [parseHtmlResults] = this.articleParseResults() ?? [];

    return parseHtmlResults
      ?.map((html, i) => ({
        section: article.sections[i],
        html,
      }))
      .filter((s) => s.html)
      ?? [];
  });
  protected readonly articleContents = computed<RenderContentsTableLink[] | undefined>(() => {
    const [, contents] = this.articleParseResults() ?? [];

    return contents ? Array.from(contents) : undefined;
  });

  protected readonly currentUrlWithoutFragment = computed(() => {
    return this.router.url.split('#')[0];
  });
}
