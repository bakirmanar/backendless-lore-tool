import { Component, Signal, signal, ViewEncapsulation } from '@angular/core';
import { LoreArticle, LoreSectionAccess } from './models';
import { StateService } from './services'

@Component({
  selector: 'app-root',
  standalone: false,
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
  // encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  articles: Signal<LoreArticle[]> ;
  editing = signal(false);
  constructor(private readonly state: StateService) {
    this.articles = this.state.articles;
  }

  toggleEdit() { this.editing.update(v => !v); }

  addArticle() {
    const article: LoreArticle = {
      id: crypto.randomUUID(),
      title: 'New Section',
      sections: [ { access: LoreSectionAccess.PUBLIC, text: 'Write public lore here' } ],
    } as any;
    this.state.addArticle(article);
  }

  onUpdate(updated: LoreArticle) { this.state.updateArticle(updated); }

  onRemove(id: string) {
    if (!confirm('Delete this section?')) return;
    this.state.removeArticle(id);
  }

  persist() { /* state persists on change */ }

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
          this.state.setArticles(data); this.persist();
        } catch { alert('Invalid JSON snapshot.'); }
      });
    };
    input.click();
  }

  seedDemo() {
    this.state.setArticles([
      { id: crypto.randomUUID(), title: 'The City of Grewatch (Gravewatch)', sections: [
        { access: LoreSectionAccess.PUBLIC, text: 'A city displaced by a mystic surge, fused into a mountain ridge and wrapped in an unstable barrier. Traders call it Grewatch; locals still whisper Gravewatch.' }
      ] },
      { id: crypto.randomUUID(), title: 'Mystic Plane - Travel Notes', sections: [
        { access: LoreSectionAccess.PUBLIC, text: 'Compass spins; paths fold. Following "silver rivers" of energy shortens journeys, but wanderers risk looping back a day older.' }
      ] },
    ] as any);
    this.persist();
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




