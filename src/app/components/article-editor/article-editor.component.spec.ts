import { TextCompletionDirective } from '@app/directives';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZoneChangeDetection, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayModule, OverlayContainer } from '@angular/cdk/overlay';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Article } from '@app/models';
import { StateService } from '@app/services';
import { ArticleEditorComponent, CompletionPanelComponent } from '@app/components';
import { MatOptionModule } from '@angular/material/core';

describe('ArticleEditorComponent', () => {
  let fixture: ComponentFixture<ArticleEditorComponent>;
  let textarea: HTMLTextAreaElement;
  let overlay: HTMLElement;
  const articles: Article[] = [
    { id: '123', title: 'First article', accessTags: [], sections: [] },
    { id: '456', title: 'Second article', accessTags: [], sections: [] },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ArticleEditorComponent, CompletionPanelComponent],
      imports: [MatOptionModule, TextCompletionDirective, ReactiveFormsModule, NoopAnimationsModule, OverlayModule, TextFieldModule,
        MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatIconModule, MatButtonModule],
      providers: [provideZoneChangeDetection({ eventCoalescing: true }),
        { provide: StateService, useValue: { articles: signal(articles), state: {} } }],
    }).compileComponents();
    fixture = TestBed.createComponent(ArticleEditorComponent);
    fixture.componentRef.setInput('article', {
      ...articles[0], sections: [{ id: 'section', accessTags: [], content: '' }],
    });
    fixture.detectChanges();
    textarea = (fixture.nativeElement as HTMLElement).querySelector('textarea')!;
    overlay = TestBed.inject(OverlayContainer).getContainerElement();
  });

  function type(value: string, caret = value.length): void {
    textarea.value = value;
    textarea.setSelectionRange(caret, caret);
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true, data: '[' }));
    fixture.detectChanges();
  }

  function key(key: string): void {
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    fixture.detectChanges();
  }

  it('lists all articles and replaces only the trigger, updating the form and caret', () => {
    let changed: Article | undefined;
    fixture.componentInstance.articleChange.subscribe(article => changed = article);
    type('Before [[ after', 9);
    const options = overlay.querySelectorAll<HTMLElement>('mat-option');
    expect(options.length).toBe(2);
    options[0].click();
    fixture.detectChanges();
    expect(textarea.value).toBe('Before [[123|]] after');
    expect(textarea.selectionStart).toBe(13);
    expect(textarea.selectionEnd).toBe(13);
    expect(changed?.sections[0].content).toBe(textarea.value);
    expect(overlay.querySelector('[role="listbox"]')).toBeNull();
  });

  it('selects using the arrow keys and Enter', () => {
    type('[[');
    key('ArrowDown');
    key('Enter');
    expect(textarea.value).toBe('[[456|]]');
    expect(textarea.selectionStart).toBe(6);
  });

  it('filters article queries and replaces the entire trigger and query', () => {
    type('Before [[second');
    const options = overlay.querySelectorAll<HTMLElement>('mat-option');
    expect(options.length).toBe(1);
    expect(options[0].textContent).toContain('Second article');
    options[0].click();
    fixture.detectChanges();
    expect(textarea.value).toBe('Before [[456|]]');
    expect(textarea.selectionStart).toBe(13);
  });

  it('keeps scroll position while editing a tall autosized textarea', async () => {
    const content = 'A line of article content\n'.repeat(100);
    const host = fixture.nativeElement as HTMLElement;
    Object.assign(host.style, { display: 'block', height: '300px', width: '600px', overflow: 'auto' });
    type(content);
    await fixture.whenStable();
    fixture.detectChanges();
    textarea = host.querySelector('textarea')!;
    expect(textarea.value).toBe(content);
    expect(textarea.clientHeight).toBeGreaterThan(host.clientHeight);
    textarea.focus({ preventScroll: true });
    textarea.setSelectionRange(0, 0);
    host.scrollTop = host.scrollHeight - host.clientHeight;
    const scrollTop = host.scrollTop;
    expect(scrollTop).toBeGreaterThan(300);
    textarea.setRangeText('a', 0, 0, 'end');
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true, data: 'a' }));
    await fixture.whenStable();
    expect(host.scrollTop).toBeCloseTo(scrollTop, 0);
  });

  for (const selection of ['mouse', 'keyboard']) {
    it(`preserves native undo and redo after ${selection} selection`, () => {
      let changed: Article | undefined;
      fixture.componentInstance.articleChange.subscribe(article => changed = article);
      type('Before [[ after', 9);
      if (selection === 'mouse') {
        overlay.querySelector<HTMLElement>('mat-option')!.click();
      } else {
        key('Enter');
      }
      fixture.detectChanges();
      expect(textarea.value).toBe('Before [[123|]] after');

      // Synthetic keyboard events do not run browser default actions. Execute
      // the native editing commands used by Ctrl+Z and Ctrl+Y instead.
      expect(textarea.ownerDocument.execCommand('undo')).toBeTrue();
      fixture.detectChanges();
      expect(textarea.value).toBe('Before [[ after');
      expect(changed?.sections[0].content).toBe('Before [[ after');

      expect(textarea.ownerDocument.execCommand('redo')).toBeTrue();
      fixture.detectChanges();
      expect(textarea.value).toBe('Before [[123|]] after');
      expect(changed?.sections[0].content).toBe('Before [[123|]] after');
    });
  }

  it('dismisses with Escape without changing content and opens for a new trigger', () => {
    type('[[');
    key('Escape');
    expect(textarea.value).toBe('[[');
    expect(overlay.querySelector('[role="listbox"]')).toBeNull();
    type('[[ text [[');
    expect(overlay.querySelector('[role="listbox"]')).not.toBeNull();
  });

  it('closes when the trigger is deleted or the caret is moved', () => {
    type('[[');
    type('[');
    expect(overlay.querySelector('[role="listbox"]')).toBeNull();
    type('[[');
    key('ArrowLeft');
    expect(overlay.querySelector('[role="listbox"]')).toBeNull();
  });
});
