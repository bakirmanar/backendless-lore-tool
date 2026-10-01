import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayContainer } from '@angular/cdk/overlay';
import { of } from 'rxjs';
import { CompletionProvider } from '@app/models';
import { TextCompletionDirective } from '@app/directives';
import { CompletionPanelComponent } from '@app/components';
import { MatOptionModule } from '@angular/material/core';

@Component({
  standalone: false,
  template: `
    <textarea [formControl]="first" [appTextCompletion]="providers"></textarea>
    <textarea [formControl]="second" [appTextCompletion]="providers"></textarea>
  `,
})
class CompletionTestHostComponent {
  readonly first = new FormControl('', { nonNullable: true });
  readonly second = new FormControl('', { nonNullable: true });
  readonly providers: CompletionProvider[] = [
    {
      id: 'users',
      match: (context) => {
        if (context.selectionStart !== context.selectionEnd) {
          return null;
        }
        const result = /@([a-z]*)$/.exec(context.text.slice(0, context.selectionStart));
        if (!result) {
          return null;
        }
        return { start: result.index, end: context.selectionStart, trigger: '@', query: result[1] };
      },
      search: () =>
        of([{ id: 'alice', label: 'Alice', insertion: { text: '@alice ', caretOffset: 7 } }]),
    },
  ];
}

describe('TextCompletionDirective', () => {
  let fixture: ComponentFixture<CompletionTestHostComponent>;
  let textareas: NodeListOf<HTMLTextAreaElement>;
  let overlay: HTMLElement;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompletionTestHostComponent, CompletionPanelComponent],
      imports: [ReactiveFormsModule, TextCompletionDirective, MatOptionModule, NoopAnimationsModule],
    }).compileComponents();
    fixture = TestBed.createComponent(CompletionTestHostComponent);
    fixture.detectChanges();
    textareas = (fixture.nativeElement as HTMLElement).querySelectorAll('textarea');
    overlay = TestBed.inject(OverlayContainer).getContainerElement();
  });
  function type(value: string, index = 0): void {
    const textarea = textareas[index];
    textarea.focus();
    textarea.value = value;
    textarea.setSelectionRange(value.length, value.length);
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
    fixture.detectChanges();
  }
  function key(key: string): void {
    textareas[0].dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
  }

  it('inserts user suggestions and synchronizes the existing form control', () => {
    type('Hello @a');
    overlay.querySelector<HTMLElement>('mat-option')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.first.value).toBe('Hello @alice ');
    expect(fixture.componentInstance.first.dirty).toBeTrue();
    expect(textareas[0].selectionStart).toBe(13);
    expect(document.activeElement).toBe(textareas[0]);
  });

  it('keeps a dismissed trigger closed while typing and allows a new trigger', () => {
    type('@');
    key('Escape');
    type('@a');
    expect(overlay.querySelector('[role="listbox"]')).toBeNull();
    type('@a @');
    expect(overlay.querySelector('[role="listbox"]')).not.toBeNull();
  });

  it('gives different textareas unique accessibility IDs and independent sessions', () => {
    type('@');
    const firstId = textareas[0].getAttribute('aria-controls');
    type('@', 1);
    expect(textareas[0].getAttribute('aria-controls')).toBeNull();
    expect(textareas[1].getAttribute('aria-controls')).not.toBe(firstId);
    expect(overlay.querySelectorAll('[role="listbox"]').length).toBe(1);
  });

  it('closes on reset, composition and destruction', () => {
    type('@');
    fixture.componentInstance.first.reset();
    fixture.detectChanges();
    expect(overlay.querySelector('[role="listbox"]')).toBeNull();
    type('@');
    textareas[0].dispatchEvent(new CompositionEvent('compositionstart'));
    fixture.detectChanges();
    expect(overlay.querySelector('[role="listbox"]')).toBeNull();
    type('@');
    fixture.destroy();
    expect(overlay.querySelector('[role="listbox"]')).toBeNull();
  });
});
