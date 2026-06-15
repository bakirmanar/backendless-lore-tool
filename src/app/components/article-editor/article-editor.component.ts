import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Article } from '@app/models';
import { StateService } from '@app/services';

@Component({
  selector: 'app-article-editor',
  standalone: false,
  templateUrl: './article-editor.component.html',
  styleUrls: ['./article-editor.component.scss']
})
export class ArticleEditorComponent implements OnInit {
  article: Article | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly state: StateService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const all = this.state.articles();
    if (this.route.routeConfig?.path === 'create') {
      this.article = {
        id: crypto.randomUUID(),
        title: 'New Article',
        accessTags: [],
        sections: [
          { id: crypto.randomUUID(), accessTags: [], content: '' }
        ]
      } satisfies Article;
    } else {
      this.article = all.find(a => a.id === id) ?? null;
    }
  }
}
