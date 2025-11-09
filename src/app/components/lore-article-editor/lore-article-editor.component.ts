import { Component, OnInit, Signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { LoreArticle } from '@app/models';
import { KeyCacheService, StateService } from '@app/services';

@Component({
  selector: 'app-lore-article-editor',
  standalone: false,
  templateUrl: './lore-article-editor.component.html',
  styleUrls: ['./lore-article-editor.component.scss']
})
export class LoreArticleEditorComponent implements OnInit {
  article: LoreArticle | null = null;
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

  onUpdate(updated: LoreArticle) {
    this.state.updateArticle(updated);
    this.router.navigate(['/']);
  }

  back() { this.router.navigate(['/']); }
}
