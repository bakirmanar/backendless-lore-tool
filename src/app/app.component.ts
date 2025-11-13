import { Component, Signal, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { LoreArticle, ArticleType } from './models';
import { StateService } from './services'
import { KeyCacheService } from './services/key-cache.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: false,
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
  // encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  readonly articles: Signal<LoreArticle[]>;
  readonly hasKey: Signal<boolean>;
  // Filters
  readonly search = new FormControl<string>('', { nonNullable: true });
  readonly typeFilter = new FormControl<ArticleType | null>(null);
  readonly ArticleType = ArticleType;
  readonly filtered: Signal<LoreArticle[]>;
  private readonly searchValue = toSignal(this.search.valueChanges.pipe(startWith(this.search.value)), { initialValue: this.search.value });
  private readonly typeValue = toSignal(this.typeFilter.valueChanges.pipe(startWith(this.typeFilter.value)), { initialValue: this.typeFilter.value });

  constructor(
    private readonly state: StateService,
    private readonly router: Router,
    private readonly keyCache: KeyCacheService,
  ) {
    this.articles = this.state.articles;
    this.hasKey = this.keyCache.hasKey;
    this.filtered = computed(() => {
      const q = (this.searchValue() || '').toLowerCase();
      const t = this.typeValue();
      return this.articles().filter(a => {
        const matchTitle = !q || a.title.toLowerCase().includes(q);
        const matchType = t == null || a.type === t;
        return matchTitle && matchType;
      });
    });
  }

  goCreate() { this.router.navigate(['/create']); }


  exportJSON() {
    const blob = new Blob([JSON.stringify(this.articles(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'lore-sheet.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  importJSON() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'application/json';
    input.onchange = () => {
      const file = input.files?.[0]; if (!file) return;
      file.text().then(txt => {
        try {
          const data = JSON.parse(txt) as LoreArticle[];
          if (!Array.isArray(data)) throw new Error('Bad file');
          this.state.setArticles(data);
        } catch { alert('Invalid JSON snapshot.'); }
      });
    };
    input.click();
  }

  seedDemo() {
    // this.state.setArticles([
    //   { id: crypto.randomUUID(), title: 'The City of Grewatch (Gravewatch)', sections: [
    //     { access: LoreSectionAccess.PUBLIC, text: 'A city displaced by a mystic surge, fused into a mountain ridge and wrapped in an unstable barrier. Traders call it Grewatch; locals still whisper Gravewatch.' }
    //   ] },
    //   { id: crypto.randomUUID(), title: 'Mystic Plane - Travel Notes', sections: [
    //     { access: LoreSectionAccess.PUBLIC, text: 'Compass spins; paths fold. Following "silver rivers" of energy shortens journeys, but wanderers risk looping back a day older.' }
    //   ] },
    // ] as any);
  }
}

// ---------- HOW TO USE ----------
// 1) Create a new Angular project (standalone):
//    npm create @angular@latest lore-sheet-angular
//    cd lore-sheet-angular
// 2) Replace generated files with the structure above (add files under src/app and src/main.ts).
// 3) Add FormsModule usage is already imported in AppComponent (standalone). No extra modules needed.
// 4) Run: npm start (or: ng serve) and open http://localhost:4200
// 5) Share: deploy the built app (ng build --configuration production) to any static host.
//    Use Export/Import JSON to share snapshots with others; distribute passphrases separately.



