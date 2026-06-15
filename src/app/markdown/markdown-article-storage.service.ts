import { inject, Injectable, signal } from '@angular/core';
import { Article } from '@app/models';
import { StateService } from '@app/services';
import { RenderContentsTableLink } from '@app/markdown/render-article.types';


@Injectable({
  providedIn: 'root',
})
export class MarkdownArticleStorageService {
  public currentArticleContents: Map<string, RenderContentsTableLink> = new Map();


  parsingStarted(): void {
    this.currentArticleContents = new Map();
  }

  parsingEnded(): void {

    this.currentArticleContents = new Map();
  }
}
