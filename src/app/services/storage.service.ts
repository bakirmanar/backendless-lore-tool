import { Injectable } from '@angular/core';
import { LoreArticle, LoreSection, LoreSectionAccess } from '../models';

const KEY = 'loreSheetData';

@Injectable({ providedIn: 'root' })
export class StorageService {
  save(articles: LoreArticle[]) { localStorage.setItem(KEY, JSON.stringify(articles)); }
  load(): LoreArticle[] | null {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    try {
      const data = JSON.parse(raw) as any[];
      if (!Array.isArray(data)) return null;
      // Migrate older shape { publicText, gmEnc }
      return data.map((c: any) => {
        if (Array.isArray(c.sections)) {
          const sections: LoreSection[] = (c.sections as any[]).map((s: any) => {
            if (s && 'access' in s) return s as LoreSection;
            if (s && 'kind' in s) {
              if (s.kind === 'public' || s.kind === LoreSectionAccess.PUBLIC) {
                return { access: LoreSectionAccess.PUBLIC, text: s.text ?? '' } as LoreSection;
              }
              if (s.kind === 'private' || s.kind === LoreSectionAccess.PRIVATE) {
                return { access: LoreSectionAccess.PRIVATE, enc: s.enc } as LoreSection;
              }
            }
            return s as LoreSection;
          });
          return { id: c.id, title: c.title, sections } as LoreArticle;
        }
        const sections: LoreSection[] = [];
        if (typeof c.publicText === 'string') sections.push({ access: LoreSectionAccess.PUBLIC, text: c.publicText });
        if (c.gmEnc) sections.push({ access: LoreSectionAccess.PRIVATE, enc: c.gmEnc });
        return {
          id: c.id,
          title: c.title,
          sections,
        } as LoreArticle;
      });
    } catch {
      return null;
    }
  }
  clear() { localStorage.removeItem(KEY); }
}
