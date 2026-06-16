import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing-module';
import { AppComponent } from './app.component';
import {
  ArticleViewerComponent,
  ArticleEditorComponent,
  AppHeaderComponent,
  ArticleListComponent,
  PassphraseDialogComponent,
  LayoutWithNavComponent,
  LayoutWithoutNavComponent,
} from '@app/components';
import { LoadBundlePage, ViewArticlePageComponent } from '@app/pages';
import { ReactiveFormsModule } from '@angular/forms';
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
import { MatSidenavModule } from '@angular/material/sidenav';
import { TextFieldModule } from '@angular/cdk/text-field';

@NgModule({
  declarations: [
    AppComponent,
    ArticleViewerComponent,
    ArticleEditorComponent,
    ViewArticlePageComponent,
    AppHeaderComponent,
    PassphraseDialogComponent,
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
    MatCardModule,
    MatSidenavModule,
    TextFieldModule,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
