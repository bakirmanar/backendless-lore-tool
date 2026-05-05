import { Injectable } from '@angular/core';
import { AppState, Article } from '@app/models';

const KEY = 'loreSheetData';

@Injectable({ providedIn: 'root' })
export class StorageService {
  save(state: AppState) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  load(): AppState | null {
    const raw = localStorage.getItem(KEY);

    if (!raw) return null;

    try {
      return JSON.parse(raw) as AppState;
      //
      // if (!Array.isArray(data)) return null;
      //
      // // Migrate older shape { publicText, gmEnc }
      // return data.map((c: any) => {
      //   if (Array.isArray(c.sections)) {
      //     const sections: ArticleSection[] = (c.sections as any[]).map((s: any) => {
      //       if (s && 'access' in s) return s as ArticleSection;
      //       if (s && 'kind' in s) {
      //         if (s.kind === 'public' || s.kind === ContentAccess.PUBLIC) {
      //           return { accessTags: ContentAccess.PUBLIC, text: s.text ?? '' } as ArticleSection;
      //         }
      //         if (s.kind === 'private' || s.kind === ContentAccess.PRIVATE) {
      //           return { accessTags: ContentAccess.PRIVATE, enc: s.enc } as ArticleSection;
      //         }
      //       }
      //       return s as ArticleSection;
      //     });
      //     return { id: c.id, title: c.title, sections } as Article;
      //   }
      //
      //   // From old type
      //   const sections: ArticleSection[] = [];
      //   if (typeof c.publicText === 'string') sections.push({ accessTags: ContentAccess.PUBLIC, text: c.publicText });
      //   if (c.gmEnc) sections.push({ accessTags: ContentAccess.PRIVATE, decrypted: false, enc: c.gmEnc });
      //   return {
      //     id: c.id,
      //     title: c.title,
      //     sections,
      //   } as Article;
      // });

    } catch {
      return null;
    }
  }

  clear() {
    localStorage.removeItem(KEY);
  }
}
