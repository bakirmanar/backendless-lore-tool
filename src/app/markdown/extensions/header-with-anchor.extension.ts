import { inject, Injectable } from '@angular/core';
import { TokenizerAndRendererExtension, Tokens } from 'marked';
import { MarkdownArticleStorageService } from '../markdown-article-storage.service';
import { slugify, toReadableText } from '@app/helpers';

@Injectable({
  providedIn: 'root',
})
export class HeaderWithAnchorExtension {
  private readonly markdownArticleStorageService: MarkdownArticleStorageService = inject(MarkdownArticleStorageService);

  buildMarkedConfiguration(): TokenizerAndRendererExtension {
    return {
      name: 'heading',
      level: 'inline',
      tokenizer: (str) => {
        const rule = /^(#+)([^#]+)/;
        const match = rule.exec(str);

        if (match) {
          const [raw, symbol, text] = match;
          return {
            type: 'heading',
            raw,
            depth: Math.min(symbol.length, 6),
            text
          } satisfies Tokens.Generic
        }

        return undefined;
      },
      renderer: (token: any) => {
        const id = this.createUniqueSlug(token.text);
        this.markdownArticleStorageService.currentArticleContents.set(id, {
          label: toReadableText(token.text),
          href: id,
          depth: token.depth
        });

        return `<h${token.depth} id="${id}">${token.text}</h${token.depth}>`;
      }
    } satisfies TokenizerAndRendererExtension
  }

  private createUniqueSlug(text: string, numberOfSameSlugs: number = 0): string {
    let slug = slugify(text);
    slug = numberOfSameSlugs === 0 ? slug : `${slug}--${numberOfSameSlugs}`;

    if (this.markdownArticleStorageService.currentArticleContents.has(slug)) {
      return this.createUniqueSlug(slug, numberOfSameSlugs + 1);
    }

    return slug;
  }
}
