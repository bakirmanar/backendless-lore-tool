import { Component, OnInit, Signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { LoreArticle, LoreSectionAccess } from '@app/models';
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
  private isCreate = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly state: StateService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const all = this.state.articles();
    if (this.route.routeConfig?.path === 'create') {
      this.isCreate = true;
      this.article = {
        id: crypto.randomUUID(),
        title: 'New Article',
        type: null,
        sections: [
          { access: LoreSectionAccess.PUBLIC, text: '' }
        ]
      } as LoreArticle;
    } else {
      this.article = all.find(a => a.id === id) ?? null;
    }
  }

  onUpdate(updated: LoreArticle) {
    if (this.isCreate) {
      this.state.addArticle(updated);
    } else {
      this.state.updateArticle(updated);
    }
    this.router.navigate(['/']);
  }

  back() { this.router.navigate(['/']); }
}
