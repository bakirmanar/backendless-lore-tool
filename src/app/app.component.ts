import { Component, inject } from '@angular/core';
import { StateImportExportService } from './services'

@Component({
  selector: 'app-root',
  standalone: false,
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
  // encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  private readonly stateImportExportService: StateImportExportService = inject(StateImportExportService);

  exportJSON() {
   this.stateImportExportService.export();
  }

  importJSON() {
    this.stateImportExportService.import();
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



