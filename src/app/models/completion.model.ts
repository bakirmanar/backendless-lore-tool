import { Observable } from 'rxjs';

export interface CompletionContext {
  text: string;
  selectionStart: number;
  selectionEnd: number;
}

export interface CompletionMatch {
  start: number;
  end: number;
  trigger: string;
  query: string;
}

export interface CompletionInsertion {
  text: string;
  caretOffset: number;
}

export interface CompletionOption {
  id: string;
  label: string;
  description?: string;
  insertion: CompletionInsertion;
}

export interface CompletionProvider {
  readonly id: string;
  match(context: CompletionContext): CompletionMatch | null;
  search(query: string): Observable<readonly CompletionOption[]>;
}

export interface CompletionSession {
  provider: CompletionProvider;
  match: CompletionMatch;
  context: CompletionContext;
  options: readonly CompletionOption[];
  activeIndex: number;
  loading: boolean;
}
