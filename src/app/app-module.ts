import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing-module';
import { AppComponent } from './app.component';
import {
  LoreArticleComponent,
  LoreArticleEditorComponent,
  ArticlePageComponent,
  AppHeaderComponent,
  ArticleListComponent,
  PassphraseDialogComponent,
  LayoutWithNavComponent,
  LayoutWithoutNavComponent
} from '@app/components';
import { LoadBundlePage } from '@app/pages';
import { ReactiveFormsModule } from '@angular/forms'
import { MarkdownPipe } from '@app/pipes';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { provideHttpClient } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    LoreArticleComponent,
    LoreArticleEditorComponent,
    ArticlePageComponent,
    AppHeaderComponent,
    PassphraseDialogComponent,
    MarkdownPipe,
    ArticleListComponent,
    LayoutWithNavComponent,
    LayoutWithoutNavComponent,
    LoadBundlePage,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatListModule,
    MatCardModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
