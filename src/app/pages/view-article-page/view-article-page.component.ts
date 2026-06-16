import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Article } from '@app/models';
import { StateService } from '@app/services';
import { routeParamSignal } from '@app/signals';

@Component({
  selector: 'app-view-article-page',
  standalone: false,
  templateUrl: './view-article-page.component.html',
  styleUrls: ['./view-article-page.component.scss']
})
export class ViewArticlePageComponent {
  protected readonly stateService: StateService = inject(StateService);
  private readonly router: Router = inject(Router);

  private readonly articleId = routeParamSignal<string>('id');
  protected readonly article = computed<Article | undefined>(() => {
    const articleId = this.articleId();
    const articles = this.stateService.articles();

    return articles && articleId
      ? articles.find((article) => article.id === articleId)
      : undefined;
  });

  edit() {
    if (!this.article()) return;

    this.router.navigate(['/edit', this.article()!.id]);
  }

  back() {
    // Should go back and not to main page
    this.router.navigate(['/']);
  }
}
