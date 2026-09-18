import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Article } from '@app/models';
import { StateService } from '@app/services';
import { routeParamSignal } from '@app/signals';

type EditArticlePageMode = 'create' | 'edit';


// TODO
//  1. Styles
//  2. After switching to preview the native history of text edits is erased because textarea is being recreated

@Component({
  selector: 'app-edit-article-page',
  standalone: false,
  templateUrl: './edit-article-page.component.html',
  styleUrls: ['./edit-article-page.component.scss'],
})
export class EditArticlePageComponent {
  private readonly stateService: StateService = inject(StateService);
  private readonly router: Router = inject(Router);

  private readonly articleId = routeParamSignal<string>('id');
  // Division on initial and updated draft is necessary to properly init form without resetting it on changes
  // (parent input -> child output-> parent)
  protected readonly initialDraft = signal<Article | null>(null);
  protected readonly updatedDraft = signal<Article | null>(null);
  protected readonly mode = computed<EditArticlePageMode>(() => (this.articleId() ? 'edit' : 'create'));
  protected readonly pageTitle = computed<string>(() =>
    this.mode() === 'create' ? 'Create Article' : 'Edit Article'
  );
  protected readonly articleNotFound = computed<boolean>(
    () => {
      return this.mode() === 'edit' && !this.findArticle()
    }
  );

  constructor() {
    effect(() => {
      let draft = this.buildInitialDraft();
      this.initialDraft.set(draft);
      this.updatedDraft.set(draft);
    });
  }

  protected updateDraft(article: Article): void {
    this.updatedDraft.set(article);
  }

  protected save(): void {
    const draft = this.updatedDraft();

    if (!draft) {
      return;
    }

    if (this.mode() === 'create') {
      this.stateService.addArticle(draft);
    } else {
      this.stateService.updateArticle(draft);
    }

    this.router.navigate(['/article', draft.id]);
  }

  protected cancel(): void {
    const articleId = this.articleId();

    if (this.mode() === 'edit' && articleId) {
      this.router.navigate(['/article', articleId]);
      return;
    }

    this.goHome();
  }

  protected goHome(): void {
    this.router.navigate(['/']);
  }

  private buildInitialDraft(): Article | null {
    if (this.mode() === 'create') {
      return this.createEmptyArticle();
    }

    const article = this.findArticle();

    return article ? this.cloneArticle(article) : null;
  }

  private findArticle(): Article | undefined {
    const articleId = this.articleId();

    return articleId
      ? this.stateService.articles().find((article) => article.id === articleId)
      : undefined;
  }

  private createEmptyArticle(): Article {
    return {
      id: crypto.randomUUID(),
      title: '',
      accessTags: [],
      sections: [],
    };
  }

  private cloneArticle(article: Article): Article {
    return {
      ...article,
      accessTags: [...article.accessTags],
      sections: article.sections.map((section) => ({
        ...section,
        accessTags: [...section.accessTags],
      })),
    };
  }
}
