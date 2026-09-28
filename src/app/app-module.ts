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
import { EditArticlePageComponent, EditTagsPageComponent, LoadBundlePage, ViewArticlePageComponent, UsersPageComponent, EditUserPageComponent, DeleteUserDialogComponent } from '@app/pages';
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
import { OverlayModule } from '@angular/cdk/overlay';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

@NgModule({
  declarations: [
    AppComponent,
    ArticleViewerComponent,
    ArticleEditorComponent,
    ViewArticlePageComponent,
    EditArticlePageComponent,
    EditTagsPageComponent,
    UsersPageComponent,
    EditUserPageComponent,
    DeleteUserDialogComponent,
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
    MatTabsModule,
    MatSnackBarModule,
    MatChipsModule,
    TextFieldModule,
    OverlayModule,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
