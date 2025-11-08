import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import * as DOMPurify from 'dompurify';

// Configure marked: GFM with line breaks, safe links open in new tab
const renderer = new marked.Renderer();
renderer.link = ({href, title, text}) => {
  const t = title ? ` title="${title}"` : '';
  const url = href ?? '';
  return `<a href="${url}"${t} target="_blank" rel="noopener noreferrer">${text}</a>`;
};
marked.setOptions({ gfm: true, breaks: true, renderer });

@Pipe({
  name: 'markdown',
  standalone: false,
})
export class MarkdownPipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer) {}

  transform(src?: string | null): SafeHtml {
    if (!src) return this.sanitizer.bypassSecurityTrustHtml('');
    const html = marked.parse(src) as string;
    // Sanitize output. Allow target/rel attributes on anchors.
    const clean = (DOMPurify as unknown as DOMPurify.DOMPurify).sanitize(html, { ADD_ATTR: ['target', 'rel'] }) as string;
    return this.sanitizer.bypassSecurityTrustHtml(clean);
  }
}
