import { startWith } from 'rxjs';
import { Component, computed, inject, Signal, ViewEncapsulation, } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { ArticleType, Article } from '@app/models';
import { KeyCacheService, StateService } from '@app/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-article-list',
  standalone: false,
  templateUrl: './article-list.component.html',
  styleUrl: './article-list.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ArticleListComponent {
  protected readonly stateService: StateService = inject(StateService);
  private readonly router: Router = inject(Router);

  private articles: Signal<Article[]> = this.stateService.articles;
  protected readonly filtered: Signal<Article[]> = computed(() => {
    const query = (this.searchValue() || '').toLowerCase();
    const type = this.typeValue();

    return this.articles().filter(article => {
      const matchTitle = !query || article.title?.toLowerCase().includes(query);
      const matchType = type == null || article.type === type;
      return matchTitle && matchType;
    });
  });

  // Filters
  protected readonly ArticleType = ArticleType;
  protected readonly search = new FormControl<string>('', { nonNullable: true });
  protected readonly typeFilter = new FormControl<ArticleType | null>(null);

  private readonly searchValue = toSignal(this.search.valueChanges.pipe(startWith(this.search.value)), { initialValue: this.search.value });
  private readonly typeValue = toSignal(this.typeFilter.valueChanges.pipe(startWith(this.typeFilter.value)), { initialValue: this.typeFilter.value });

  goCreate() {
    this.router.navigate(['/create']);
  }
}
