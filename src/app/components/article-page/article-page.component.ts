import { Component, OnInit, Signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Article } from '@app/models';
import { KeyCacheService, StateService } from '@app/services';

@Component({
  selector: 'app-article-page',
  standalone: false,
  templateUrl: './article-page.component.html',
  styleUrls: ['./article-page.component.scss']
})
export class ArticlePageComponent implements OnInit {
  article: Article | null = null;
  readonly hasKey: Signal<boolean> = inject(KeyCacheService).hasKey;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly state: StateService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const all = this.state.articles();
    this.article = all.find(a => a.id === id) ?? null;
  }

  edit() {
    if (!this.article) return;
    this.router.navigate(['/edit', this.article.id]);
  }

  back() { this.router.navigate(['/']); }
}

