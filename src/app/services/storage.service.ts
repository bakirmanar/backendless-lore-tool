import { Injectable } from '@angular/core';
import { LoreCard } from '../models';

const KEY = 'loreSheetData';

@Injectable({ providedIn: 'root' })
export class StorageService {
  save(cards: LoreCard[]) { localStorage.setItem(KEY, JSON.stringify(cards)); }
  load(): LoreCard[] | null { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; }
  clear() { localStorage.removeItem(KEY); }
}
