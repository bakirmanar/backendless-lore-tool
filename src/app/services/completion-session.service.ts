import { Injectable, OnDestroy, signal } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import {
  CompletionContext,
  CompletionMatch,
  CompletionProvider,
  CompletionSession,
} from '@app/models/completion.model';

@Injectable()
export class CompletionSessionService implements OnDestroy {
  private readonly currentSession = signal<CompletionSession | null>(null);
  private readonly errorsSubject = new Subject<void>();
  private searchSubscription?: Subscription;
  private requestId = 0;
  private dismissed: { provider: CompletionProvider; start: number; trigger: string } | null = null;
  readonly session = this.currentSession.asReadonly();
  readonly errors$ = this.errorsSubject.asObservable();

  update(context: CompletionContext, providers: readonly CompletionProvider[]): void {
    if (context.selectionStart !== context.selectionEnd) {
      this.reset();
      return;
    }

    // FIXME this is called even when a provider is active. Should it check for active provider first and only work
    //  with it?
    type Candidate = { provider: CompletionProvider; match: CompletionMatch };
    const candidate: Candidate | undefined = providers
      ?.map(provider => ({ provider , match: provider.match(context)! }))
      ?.filter(({ match }) => match
        && match.start >= 0 && match.end >= match.start
        && match.end === context.selectionStart
        && match.trigger.length
      )
      // Several can match, but find the closest
      ?.sort((a, b) => b.match.start > a.match.start
        || (b.match.start === a.match.start && b.match.trigger.length > a.match.trigger.length)
          ? 1 : -1
      )
      ?.[0];

    if (!candidate) {
      this.close();
      this.dismissed = null;
      return;
    }

    const { provider, match } = candidate;
    if (
      this.dismissed?.provider === provider
      && this.dismissed.start === match.start
      && this.dismissed.trigger === match.trigger
    ) {
      return;
    }

    this.dismissed = null;
    const previous = this.session();
    if (
      previous?.provider === provider
      && previous.match.start === match.start
      && previous.match.query === match.query
    ) {
      this.currentSession.set({ ...previous, match, context });
      return;
    }

    this.close();
    const requestId = this.requestId;
    this.currentSession.set({
      provider,
      match,
      context,
      options: [],
      activeIndex: 0,
      loading: true,
    });

    try {
      this.searchSubscription = provider.search(match.query).subscribe({
        next: (options) => {
          const current = this.session();
          if (requestId !== this.requestId || !current) {
            return;
          }

          const selectedId = current.options[current.activeIndex]?.id;
          const index = options.findIndex((option) => option.id === selectedId);
          this.currentSession.set({
            ...current,
            options,
            activeIndex: Math.max(0, index),
            loading: false,
          });
        },
        error: () => this.fail(requestId),
        complete: () => {
          const current = this.session();
          if (requestId === this.requestId && current) {
            this.currentSession.set({ ...current, loading: false });
          }
        },
      });
    } catch {
      this.fail(requestId);
    }
  }

  moveActiveOption(direction: number): void {
    const current = this.session();
    if (!current?.options.length) {
      return;
    }

    const activeIndex = (current.activeIndex + direction + current.options.length) % current.options.length;
    this.currentSession.set({ ...current, activeIndex });
  }

  dismiss(): void {
    const current = this.session();
    if (current) {
      this.dismissed = {
        provider: current.provider,
        start: current.match.start,
        trigger: current.match.trigger,
      };
    }
    this.close();
  }

  close(): void {
    this.requestId++;
    this.searchSubscription?.unsubscribe();
    this.searchSubscription = undefined;
    this.currentSession.set(null);
  }

  reset(): void {
    this.close();
    this.dismissed = null;
  }

  ngOnDestroy(): void {
    this.reset();
    this.errorsSubject.complete();
  }

  private fail(requestId: number): void {
    if (requestId === this.requestId) {
      this.dismiss();
      this.errorsSubject.next();
    }
  }
}
