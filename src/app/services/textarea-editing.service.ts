import { Injectable } from '@angular/core';
import { CompletionInsertion, CompletionMatch } from '@app/models/completion.model';

@Injectable({ providedIn: 'root' })
export class TextareaEditingService {
  getCaretPosition(textarea: HTMLTextAreaElement): { x: number; y: number } {
    // Mirror the textarea's typography and wrapping to measure the inline caret.
    const document = textarea.ownerDocument;
    const style = getComputedStyle(textarea);
    const mirror = document.createElement('div');

    for (const property of Array.from(style)) {
      mirror.style.setProperty(property, style.getPropertyValue(property));
    }

    Object.assign(mirror.style, {
      position: 'fixed',
      visibility: 'hidden',
      pointerEvents: 'none',
      margin: '0',
      transform: 'none',
      left: '0',
      top: '0',
      height: 'auto',
      minHeight: '0',
      maxHeight: 'none',
      width: `${textarea.clientWidth}px`,
      boxSizing: 'border-box',
      border: 'none',
      whiteSpace: 'pre-wrap',
      overflowWrap: 'break-word',
      overflow: 'hidden',
    });
    mirror.textContent = textarea.value.slice(0, textarea.selectionStart);
    const marker = document.createElement('span');
    marker.textContent = textarea.value.slice(textarea.selectionStart) || '\u200b';
    mirror.append(marker);
    document.body.append(mirror);

    try {
      const markerRect = marker.getClientRects()[0];
      const rect = textarea.getBoundingClientRect();
      if (!markerRect) {
        return { x: rect.left, y: rect.bottom };
      }

      let lineHeight = Number.parseFloat(style.lineHeight);
      if (!Number.isFinite(lineHeight)) {
        lineHeight = Number.parseFloat(style.fontSize) * 1.2;
      }
      return {
        x: rect.left + textarea.clientLeft + markerRect.left - textarea.scrollLeft,
        y: rect.top + textarea.clientTop + markerRect.top - textarea.scrollTop + lineHeight,
      };
    } finally {
      mirror.remove();
    }
  }

  insert(
    textarea: HTMLTextAreaElement,
    match: CompletionMatch,
    insertion: CompletionInsertion,
  ): void {
    textarea.focus({ preventScroll: true });
    textarea.setSelectionRange(match.start, match.end);
    let inserted = false;
    // insertText preserves native undo. The compatibility fallback cannot.
    try {
      inserted = textarea.ownerDocument.execCommand('insertText', false, insertion.text);
    } catch {
      inserted = false;
    }
    if (!inserted) {
      textarea.setRangeText(insertion.text, match.start, match.end, 'end');
      textarea.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
    }
    const caret = match.start + Math.max(0, Math.min(insertion.caretOffset, insertion.text.length));
    textarea.setSelectionRange(caret, caret);
  }
}
