import { TextareaEditingService } from '@app/services/textarea-editing.service';

describe('TextareaEditingService', () => {
  let textarea: HTMLTextAreaElement;
  const service = new TextareaEditingService();
  beforeEach(() => {
    textarea = document.createElement('textarea');
    document.body.append(textarea);
    textarea.value = 'Before [[ after';
  });
  afterEach(() => textarea.remove());

  it('preserves surrounding content, caret position and native undo/redo', () => {
    service.insert(
      textarea,
      { start: 7, end: 9, trigger: '[[', query: '' },
      { text: '[[123|]]', caretOffset: 6 },
    );
    expect(textarea.value).toBe('Before [[123|]] after');
    expect(textarea.selectionStart).toBe(13);
    expect(document.execCommand('undo')).toBeTrue();
    expect(textarea.value).toBe('Before [[ after');
    expect(document.execCommand('redo')).toBeTrue();
    expect(textarea.value).toBe('Before [[123|]] after');
  });

  it('emits input for the compatibility fallback', () => {
    spyOn(document, 'execCommand').and.returnValue(false);
    const input = jasmine.createSpy('input');
    textarea.addEventListener('input', input);
    service.insert(
      textarea,
      { start: 7, end: 9, trigger: '[[', query: '' },
      { text: '@alice ', caretOffset: 7 },
    );
    expect(textarea.value).toBe('Before @alice  after');
    expect(input).toHaveBeenCalledTimes(1);
  });
});
