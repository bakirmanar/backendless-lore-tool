import { Injectable } from '@angular/core';
import { RendererThis, TokenizerAndRendererExtension, TokenizerThis, Tokens } from 'marked';

type ImagePosition = 'left' | 'right' | 'fill line';
type ImageSizeOption = `${number}px` | `${number}%`;

type ImageOptions = {
  width?: ImageSizeOption;
  height?: ImageSizeOption;
  position?: ImagePosition;
};

type ImageToken = Tokens.Generic &
  Tokens.Image & {
    options?: ImageOptions;
  };

@Injectable({
  providedIn: 'root',
})
export class ImageExtension {
  buildMarkedConfiguration(): TokenizerAndRendererExtension {
    const imageExtension = this;

    return {
      name: 'image',
      level: 'inline',
      start(src: string): number {
        return src.indexOf('![');
      },
      tokenizer(this: TokenizerThis, src: string): ImageToken | undefined {
        const rule = /^!\[([^\]]*)]\(([^)\s]+)(?:\s+(['"])(.*?)\3)?\)(?:\{([^}]*)})?/;
        const match = rule.exec(src);

        if (!match) {
          return undefined;
        }

        const [, text, href, , title, rawOptions] = match;

        return {
          type: 'image',
          raw: match[0],
          href,
          title: title ?? null,
          text,
          tokens: this.lexer.inlineTokens(text),
          options: rawOptions ? imageExtension.parseOptions(rawOptions) : undefined,
        };
      },
      renderer(this: RendererThis, token: Tokens.Generic): string {
        const imageToken = token as ImageToken;
        const text = imageToken.tokens?.length
          ? (this.parser.parseInline(imageToken.tokens, this.parser.textRenderer) as string)
          : imageToken.text;

        return imageExtension.renderImage(imageToken, text);
      },
    } satisfies TokenizerAndRendererExtension;
  }

  private parseOptions(rawOptions: string): ImageOptions {
    return rawOptions.split(',').reduce<ImageOptions>((options, option) => {
      const [rawKey, rawValue] = option.split(':').map((part) => part.trim());

      if (!rawKey || !rawValue) {
        return options;
      }

      switch (rawKey) {
        case 'width':
        case 'height':
          if (this.isImageSizeOption(rawValue)) {
            options[rawKey] = rawValue;
          }
          return options;
        case 'position':
          if (this.isImagePosition(rawValue)) {
            options.position = rawValue;
          }
          return options;
        default:
          return options;
      }
    }, {});
  }

  private renderImage(token: ImageToken, text: string): string {
    const href = this.cleanHref(token.href);

    if (href === null) {
      return this.escapeAttribute(text);
    }

    const attributes = [`src="${href}"`, `alt="${this.escapeAttribute(text)}"`];

    if (token.title) {
      attributes.push(`title="${this.escapeAttribute(token.title)}"`);
    }

    const styles = this.buildStyles(token.options);

    if (styles.length) {
      attributes.push(`style="${styles.join(' ')}"`);
    }

    return `<img ${attributes.join(' ')}>`;
  }

  private buildStyles(options: ImageOptions | undefined): string[] {
    if (!options) {
      return [];
    }

    const styles: string[] = [];

    if (options.width) {
      styles.push(`width: ${options.width};`);
    }

    if (options.height) {
      styles.push(`height: ${options.height};`);
    }

    switch (options.position) {
      case 'left':
        styles.push('float: left;');
        break;
      case 'right':
        styles.push('float: right;');
        break;
      case 'fill line':
        styles.push('display: block;', 'width: 100%;');
        break;
      case undefined:
        break;
    }

    return styles;
  }

  private isImageSizeOption(value: string): value is ImageSizeOption {
    return /^\d+(?:\.\d+)?(?:px|%)$/.test(value);
  }

  private isImagePosition(value: string): value is ImagePosition {
    return value === 'left' || value === 'right' || value === 'fill line';
  }

  private cleanHref(href: string): string | null {
    try {
      return this.escapeAttribute(encodeURI(href).replace(/%25/g, '%'));
    } catch {
      return null;
    }
  }

  private escapeAttribute(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
