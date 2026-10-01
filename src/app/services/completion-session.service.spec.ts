import { of, Subject, throwError } from 'rxjs';
import { CompletionContext, CompletionOption, CompletionProvider } from '@app/models';
import { CompletionSessionService } from '@app/services/completion-session.service';

describe('CompletionSessionService', () => {
  let service: CompletionSessionService;
  const options: CompletionOption[] = [
    { id: 'alice', label: 'Alice', insertion: { text: '@alice ', caretOffset: 7 } },
    { id: 'bob', label: 'Bob', insertion: { text: '@bob ', caretOffset: 5 } },
  ];
  const provider: CompletionProvider = {
    id: 'users',
    match: (context) => {
      const result = /(?:^|\s)(@)(\w*)$/.exec(context.text.slice(0, context.selectionStart));
      if (!result) {
        return null;
      }
      return {
        start: context.selectionStart - result[2].length - 1,
        end: context.selectionStart,
        trigger: '@',
        query: result[2],
      };
    },
    search: () => of(options),
  };
  function context(text: string): CompletionContext {
    return { text, selectionStart: text.length, selectionEnd: text.length };
  }

  beforeEach(() => {
    service = new CompletionSessionService();
  });
  afterEach(() => service.ngOnDestroy());

  it('supports a non-article provider and wraps keyboard selection', () => {
    service.update(context('@'), [provider]);
    expect(service.session()?.options).toEqual(options);
    service.moveActiveOption(-1);
    expect(service.session()?.activeIndex).toBe(1);
    service.moveActiveOption(1);
    expect(service.session()?.activeIndex).toBe(0);
  });

  it('cancels old searches and ignores their late results', () => {
    const first$ = new Subject<readonly CompletionOption[]>();
    const second$ = new Subject<readonly CompletionOption[]>();
    const search = jasmine.createSpy('search').and.returnValues(first$, second$);
    service.update(context('@'), [{ ...provider, search }]);
    service.update(context('@a'), [{ ...provider, search }]);
    expect(first$.observed).toBeFalse();
    first$.next(options);
    expect(service.session()?.options).toEqual([]);
    second$.next([options[0]]);
    expect(service.session()?.options).toEqual([options[0]]);
    service.close();
    expect(second$.observed).toBeFalse();
  });

  it('suppresses a dismissed trigger until it is left or replaced', () => {
    service.update(context('@'), [provider]);
    service.dismiss();
    service.update(context('@a'), [provider]);
    expect(service.session()).toBeNull();
    service.update(context(''), [provider]);
    service.update(context('@'), [provider]);
    expect(service.session()).not.toBeNull();
  });

  it('prefers the closest match, then the longest trigger, then provider order', () => {
    const first: CompletionProvider = {
      ...provider,
      id: 'first',
      match: () => ({ start: 0, end: 3, trigger: '@', query: '' }),
    };
    const longer: CompletionProvider = {
      ...first,
      id: 'longer',
      match: () => ({ start: 0, end: 3, trigger: '@@', query: '' }),
    };
    const closest: CompletionProvider = {
      ...first,
      id: 'closest',
      match: () => ({ start: 2, end: 3, trigger: '@', query: '' }),
    };
    service.update(context('@@@'), [first, longer, closest]);
    expect(service.session()?.provider.id).toBe('closest');
    service.update(context('@@@'), [first, longer]);
    expect(service.session()?.provider.id).toBe('longer');
    service.update(context('@@@'), [first, { ...first, id: 'last' }]);
    expect(service.session()?.provider.id).toBe('first');
  });

  it('reports failed searches and closes the popup', () => {
    const error = jasmine.createSpy('error');
    service.errors$.subscribe(error);
    service.update(context('@'), [
      { ...provider, search: () => throwError(() => new Error('offline')) },
    ]);
    expect(service.session()).toBeNull();
    expect(error).toHaveBeenCalledTimes(1);
  });
});
