import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked: GFM with line breaks, safe links open in new tab
const renderer = new marked.Renderer();
renderer.link = ({ href, title, text }) => {
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
  transform(src?: string | null): string {
    if (!src) return '';
    const html = marked.parse(src) as string;
    // Sanitize output. Allow target/rel attributes on anchors.
    return DOMPurify.sanitize(html, { ADD_ATTR: ['target', 'rel'] }) as string;
  }
}

