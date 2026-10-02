import { Injectable, computed, signal, inject } from '@angular/core';
import { Article, User, AppState, StorageKeys, ArticleType, ContentAccessTag, ContentAccessTagId, OWNER_USERNAME } from '@app/models';
import { StorageService } from '@app/services';
import { defer, map, Observable, shareReplay, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StateService {
  private readonly storageService: StorageService = inject(StorageService);

  private readonly _state = signal<AppState>({
    currentUser: null,
    articles: [],
  });
  readonly articles = computed<Article[]>(() => this._state().articles);
  readonly users = computed<User[]>(() => this._state().ownerData?.users ?? []);
  readonly authorized = computed<boolean>(() => Boolean(this._state().currentUser));
  readonly authorizedAsOwner = computed<boolean>(() => Boolean(this._state().currentUser && this._state().ownerData));

  readonly initialized$: Observable<void> = defer(() =>
    this.storageService.get(StorageKeys.APP_STATE)
  ).pipe(
    tap((state) => {
      if (state) {
        this.state = state;
      }
    }),
    map(() => undefined),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  constructor() {
    this.initialized$.subscribe();
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

  isAccessTagInUse(id: ContentAccessTagId): boolean {
    const state = this._state();
    return state.articles.some((article) =>
      article.accessTags.includes(id)
      || article.sections.some((section) => section.accessTags.includes(id))
    )
      || Boolean(state.ownerData?.users.some((user) => user.access.includes(id)))
      || Boolean(state.currentUser?.access.includes(id));
  }

  setAccessTags(tags: ContentAccessTag[]): boolean {
    const state = this._state();
    if (!this.authorizedAsOwner() || !state.ownerData) {
      return false;
    }

    const ids = new Set(tags.map((tag) => tag.id));
    if (
      ids.size !== tags.length
      || tags.some((tag) => !tag.name.trim())
      || state.ownerData.accessTags.some((tag) => !ids.has(tag.id) && this.isAccessTagInUse(tag.id))
    ) {
      return false;
    }

    this._state.set({
      ...state,
      ownerData: {
        ...state.ownerData,
        accessTags: tags.map((tag) => ({ ...tag, name: tag.name.trim() })),
      },
    });
    this.persist();
    return true;
  }

  async saveUser(user: User, create: boolean): Promise<void> {
    const state = this._state();
    if (!this.authorizedAsOwner() || !state.ownerData) {
      throw new Error('Only the owner can manage users.');
    }
    const existing = state.ownerData.users.find((item) => item.id === user.id);
    if ((create && existing) || (!create && !existing)) {
      throw new Error('This user could not be saved. Reload the users page and try again.');
    }
    if (!user.name.trim() || !user.password.trim()) {
      throw new Error('Enter a username and password.');
    }
    const others = state.ownerData.users.filter((item) => item.id !== user.id);
    if (others.some((item) => item.name.toLowerCase() === user.name.trim().toLowerCase())) {
      throw new Error('This username is already in use.');
    }
    if (others.some((item) => item.password === user.password)) {
      throw new Error('Each user needs a different password because sign-in uses only a password.');
    }
    const isOwner = existing?.name === OWNER_USERNAME;
    if (isOwner && user.name !== OWNER_USERNAME) {
      throw new Error('The owner username cannot be changed.');
    }
    if (!isOwner && user.name.trim().toLowerCase() === OWNER_USERNAME.toLowerCase()) {
      throw new Error('This username is reserved for the owner.');
    }
    const access = isOwner ? [...(existing?.access ?? [])] : [...new Set(user.access)];
    if (!isOwner && access.some((id) => !state.ownerData!.accessTags.some((tag) => tag.id === id))) {
      throw new Error('One or more selected tags no longer exist.');
    }
    const savedUser = { ...user, name: user.name.trim(), access };
    const users = create
      ? [...state.ownerData.users, savedUser]
      : state.ownerData.users.map((item) => item.id === user.id ? savedUser : item);
    const nextState = {
      ...state,
      currentUser: isOwner ? savedUser : state.currentUser,
      ownerData: { ...state.ownerData, users },
    };
    await this.storageService.set(StorageKeys.APP_STATE, nextState);
    this._state.set(nextState);
  }

  async removeUser(id: string): Promise<void> {
    const state = this._state();
    if (!this.authorizedAsOwner() || !state.ownerData) {
      throw new Error('Only the owner can manage users.');
    }
    if (state.ownerData.users.some((user) => user.id === id && user.name === OWNER_USERNAME)) {
      throw new Error('The owner cannot be deleted.');
    }
    if (!state.ownerData.users.some((user) => user.id === id)) {
      throw new Error('This user no longer exists.');
    }
    const nextState = {
      ...state,
      ownerData: { ...state.ownerData, users: state.ownerData.users.filter((user) => user.id !== id) },
    };
    await this.storageService.set(StorageKeys.APP_STATE, nextState);
    this._state.set(nextState);
  }

  private async persist(): Promise<void> {
    return this.storageService.set(StorageKeys.APP_STATE, this._state());
  }
}
