import { TestBed } from '@angular/core/testing';
import { MatOptionModule } from '@angular/material/core';
import { CompletionPanelComponent } from '@app/components/completion-panel/completion-panel.component';
import { CompletionOption } from '@app/models';

describe('CompletionPanelComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompletionPanelComponent],
      imports: [MatOptionModule],
    });
  });

  it('renders loading and empty states', () => {
    const fixture = TestBed.createComponent(CompletionPanelComponent);
    fixture.componentRef.setInput('panelId', 'test-panel');
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Loading suggestions');
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No suggestions');
  });

  it('renders labels and descriptions and emits a selected option', () => {
    const fixture = TestBed.createComponent(CompletionPanelComponent);
    const option: CompletionOption = {
      id: 'alice',
      label: 'Alice',
      description: 'Writer',
      insertion: { text: '@alice', caretOffset: 6 },
    };
    fixture.componentRef.setInput('panelId', 'test-panel');
    fixture.componentRef.setInput('options', [option]);
    const selected = jasmine.createSpy('selected');
    fixture.componentInstance.optionSelected.subscribe(selected);
    fixture.detectChanges();
    const element = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      'mat-option',
    )!;
    expect(element.textContent).toContain('Alice');
    expect(element.textContent).toContain('Writer');
    // Keyboard focus is exposed through aria-activedescendant on the textarea;
    // highlighting an option does not select it before the user confirms.
    expect(element.classList.contains('completion-active')).toBeTrue();
    element.click();
    expect(selected).toHaveBeenCalledWith(option);
  });
});
