import {
  ComponentRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl } from '@angular/forms';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompletionPanelComponent } from '@app/components/completion-panel/completion-panel.component';
import { CompletionOption, CompletionProvider } from '@app/models/completion.model';
import { CompletionSessionService } from '@app/services/completion-session.service';
import { TextareaEditingService } from '@app/services/textarea-editing.service';

let nextPanelId = 0;

// TODO Performance optimization (find other comments, especially in update/render flow)

@Directive({
  selector: 'textarea[appTextCompletion]',
  providers: [CompletionSessionService],
  host: {
    '(input)': 'onInput($event)',
    '(keydown)': 'onKeydown($event)',
    '(click)': 'onCaretChange()',
    '(keyup)': 'onCaretChange()',
    '(blur)': 'close()',
    '(scroll)': 'close()',
    '(compositionstart)': 'close()',
    '(compositionend)': 'update()',
    'aria-autocomplete': 'list',
    '[attr.aria-expanded]': 'completionSessionService.session() !== null',
    '[attr.aria-controls]': 'completionSessionService.session() ? panelId : null',
    '[attr.aria-activedescendant]': 'activeOptionId',
  },
})
export class TextCompletionDirective implements OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLTextAreaElement>>(ElementRef);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly textareaEditingService = inject(TextareaEditingService);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly matSnackBar = inject(MatSnackBar);
  protected readonly completionSessionService = inject(CompletionSessionService);

  readonly providers = input.required<readonly CompletionProvider[]>({
    alias: 'appTextCompletion',
  });

  protected readonly panelId = `text-completion-${nextPanelId++}`;
  private overlayRef?: OverlayRef;
  private panelRef?: ComponentRef<CompletionPanelComponent>;
  private inserting = false;
  private lastValue = '';
  private lastCaret = -1;
  private readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -24 },
  ];

  constructor() {
    effect(() => {
      // FIXME happens on every input. Probably happens so, because session is recreated on every input
      this.render();
    });
    effect(() => {
      // Does it even do anything?
      this.providers();
      this.close();
    });
    // FIXME I suspect that two textareas each with Completion directive each will display the error without checking
    //  if error belongs to that textarea
    this.completionSessionService.errors$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.matSnackBar.open('Could not load suggestions.', 'Dismiss', { duration: 5000 });
    });
  }

  protected get activeOptionId(): string | null {
    const session = this.completionSessionService.session();
    return session?.options.length ? `${this.panelId}-option-${session.activeIndex}` : null;
  }

  // There was in issue before when it either closed when not needed or was not closed when needed due to some actions
  // not tracked by the form. Now I can not reproduce it but left this commented out just in case.
  // ngDoCheck(): void {
  //   const textarea = this.elementRef.nativeElement;
  //   const pristine = this.ngControl?.control?.pristine ?? true;
  //   if (
  //     textarea.value !== this.lastValue
  //     || textarea.disabled
  //     || textarea.readOnly
  //     || (pristine && !this.wasPristine)
  //   ) {
  //     this.close();
  //     this.lastValue = textarea.value;
  //   }
  // }

  protected onInput(event: Event): void {
    if (this.inserting) {
      return;
    }

    if (
      event instanceof InputEvent
      && (event.isComposing || event.inputType === 'historyUndo' || event.inputType === 'historyRedo')
    ) {
      this.close();
      return;
    }

    this.update();
  }

  protected update(): void {
    const textarea = this.elementRef.nativeElement;
    this.lastValue = textarea.value;
    this.lastCaret = textarea.selectionStart;

    if (textarea.disabled || textarea.readOnly) {
      this.close();
      return;
    }

    // FIXME Calling this on each key up is very concerning
    this.completionSessionService.update(
      {
        text: textarea.value,
        selectionStart: textarea.selectionStart,
        selectionEnd: textarea.selectionEnd,
      },
      this.providers(),
    );
  }

  protected onCaretChange(): void {
    if (
      this.elementRef.nativeElement.selectionStart !== this.lastCaret
      || this.elementRef.nativeElement.selectionEnd !== this.lastCaret
    ) {
      this.completionSessionService.reset();
      this.lastCaret = this.elementRef.nativeElement.selectionStart;
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.isComposing || !this.completionSessionService.session()) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.completionSessionService.dismiss();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowUp' ? -1 : 1;
      this.completionSessionService.moveActiveOption(direction);
    } else if (event.key === 'Enter') {
      const session = this.completionSessionService.session();
      const option = session?.options[session.activeIndex];
      if (option) {
        event.preventDefault();
        this.select(option);
      } else {
        this.close();
      }
    } else if (
      ['Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)
    ) {
      this.close();
    }
  }

  protected close(): void {
    this.completionSessionService.reset();
  }

  private select(option: CompletionOption): void {
    const session = this.completionSessionService.session();
    const textarea = this.elementRef.nativeElement;

    if (
      !session
      || textarea.value !== session.context.text
      || textarea.selectionStart !== session.match.end
      || textarea.selectionEnd !== session.match.end
      || textarea.disabled
      || textarea.readOnly
    ) {
      this.close();
      return;
    }

    this.close();
    this.inserting = true;

    try {
      this.textareaEditingService.insert(textarea, session.match, option.insertion);
      // Preserve Angular's default value accessor and avoid a DOM write that
      // would discard undo history if native insertText omits an input event.
      const control = this.ngControl?.control;
      if (control && control.value !== textarea.value) {
        textarea.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
      }
    } finally {
      this.inserting = false;
      this.lastValue = textarea.value;
      this.lastCaret = textarea.selectionStart;
    }
  }

  private render(): void {
    const session = this.completionSessionService.session();

    if (!session) {
      this.overlayRef?.dispose();
      this.overlayRef = undefined;
      this.panelRef = undefined;
      return;
    }

    const textarea = this.elementRef.nativeElement;
    const origin = this.textareaEditingService.getCaretPosition(textarea);

    // TODO I don't like that we update position strategy instead of updating just position. Moreover, it happens on
    //  every kep up. Also we calculate caret position on every key up, for which we create an html element
    if (this.overlayRef) {
      this.overlayRef.updatePositionStrategy(this.buildPositionStrategy(origin));
    } else {
      this.overlayRef = this.createOverlayRef(origin)
    }

    this.panelRef?.setInput('panelId', this.panelId);
    this.panelRef?.setInput('options', session.options);
    this.panelRef?.setInput('activeIndex', session.activeIndex);
    this.panelRef?.setInput('loading', session.loading);
    this.panelRef?.changeDetectorRef.detectChanges();
    this.overlayRef.overlayElement
      .querySelector<HTMLElement>(`#${this.activeOptionId}`)
      ?.scrollIntoView({ block: 'nearest' });
  }

  private createOverlayRef(origin: { x: number; y: number }): OverlayRef {
    const overlayRef = this.overlay.create({
      positionStrategy: this.buildPositionStrategy(origin),
      scrollStrategy: this.overlay.scrollStrategies.close(),
    });
    overlayRef.detachments().subscribe(() => {
      if (this.completionSessionService.session()) {
        this.close();
      }
    });
    overlayRef.outsidePointerEvents().subscribe(() => this.close());
    this.panelRef = overlayRef.attach(new ComponentPortal(CompletionPanelComponent, this.viewContainerRef));
    this.panelRef.instance.optionSelected.subscribe((option) => this.select(option));

    return overlayRef;
  }

  private buildPositionStrategy(origin: { x: number; y: number }) {
    return this.overlay
      .position()
      .flexibleConnectedTo(origin)
      .withViewportMargin(8)
      .withPositions(this.positions);
  }

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
  }
}
