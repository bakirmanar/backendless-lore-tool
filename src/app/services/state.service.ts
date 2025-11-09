import { Injectable, computed, signal } from '@angular/core';
import { LoreArticle } from '@app/models';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class StateService {
  private readonly _articles = signal<LoreArticle[]>([]);
  readonly articles = computed(() => this._articles());

  constructor(private readonly storageService: StorageService) {
    const initial = this.storageService.load() ?? [];
    this._articles.set(initial);
  }

  setArticles(list: LoreArticle[]) {
    this._articles.set(list);
    this.persist();
  }

  addArticle(article: LoreArticle) {
    this._articles.update(arr => [...arr, article]);
    this.persist();
  }

  updateArticle(updated: LoreArticle) {
    this._articles.update(arr => arr.map(a => a.id === updated.id ? updated : a));
    this.persist();
  }

  removeArticle(id: string) {
    this._articles.update(arr => arr.filter(a => a.id !== id));
    this.persist();
  }

  private persist() { this.storageService.save(this._articles()); }
}
