import { Injectable, computed, signal, inject } from '@angular/core';
import { Article, User, AppState, StorageKeys } from '@app/models';
import { StorageService } from '@app/services';

const generateAppStateTestData = (): AppState => {
  const graywatchTag = { id: crypto.randomUUID(), name: 'Greywatch' };
  const newEraTag = { id: crypto.randomUUID(), name: 'New era' };

  const ownerUser: User = {
    id: crypto.randomUUID(),
    name: 'OWNER',
    password: 'asd',
    access: []
  }

  return {
    currentUser: ownerUser,
    articles: [
      {
        id: crypto.randomUUID(),
        title: 'The old times',
        accessTags: [],
        sections: [
          {
            id: crypto.randomUUID(),
            accessTags: [],
            content: 'The very bad things happened here'
          },
          {
            id: crypto.randomUUID(),
            accessTags: [graywatchTag.id],
            content: 'Also Graywatch is here',
          }
        ]
      },
      {
        id: crypto.randomUUID(),
        title: 'New Era',
        accessTags: [newEraTag.id],
        sections: [
          {
            id: crypto.randomUUID(),
            accessTags: [],
            content: 'Let me tell you a story about New Era'
          },
          {
            id: crypto.randomUUID(),
            accessTags: [graywatchTag.id],
            content: 'Surprise! Graywatch is here too',
          }
        ]
      }
    ],
    ownerData: {
      accessTags: [
        graywatchTag,
        newEraTag
      ],
      users: [
        {...ownerUser},
        {
          id: crypto.randomUUID(),
          name: 'Кукумявки',
          access: [
            newEraTag.id,
          ],
          password: '112233'
        }
      ]
    }
  }
}

@Injectable({ providedIn: 'root' })
export class StateService {
  private readonly storageService: StorageService = inject(StorageService);

  private readonly _state = signal<AppState>({
    currentUser: null,
    articles: [],
  });
  readonly articles = computed<Article[]>(() => this._state().articles);
  readonly authorized = computed<boolean>(() => Boolean(this._state().currentUser));
  readonly authorizedAsOwner = computed<boolean>(() => Boolean(this._state().currentUser && this._state().ownerData));

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    const state = (await this.storageService.get(StorageKeys.APP_STATE)) ?? generateAppStateTestData();

    if (state) {
      this.state = state;
    }
  }

  get state(): AppState {
    return this._state();
  }

  set state(state: AppState) {
    this._state.set(state);
    this.persist();
  }

  setArticles(list: Article[]) {
    this._state.update((current) => ({
      ...current,
      articles: list,
    }));
    this.persist();
  }

  addArticle(article: Article) {
    this._state.update((current) => ({
      ...current,
      articles: [
        ...current.articles,
        article,
      ],
    }));
    this.persist();
  }

  updateArticle(updated: Article) {
    this._state.update((current) => ({
      ...current,
      articles: current.articles.map((a) => a.id === updated.id ? updated : a),
    }));
    this.persist();
  }

  async removeArticle(id: string) {
    this._state.update((current) => ({
      ...current,
      articles: current.articles.filter((a) => a.id !== id),
    }));
    this.persist();
  }

  private async persist(): Promise<void> {
    return this.storageService.set(StorageKeys.APP_STATE, this._state());
  }
}
