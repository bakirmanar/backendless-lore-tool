import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing-module';
import { AppComponent } from './app.component';
import { LoreArticleComponent, LoreArticleEditorComponent, ArticlePageComponent } from '@app/components';
import { AppHeaderComponent } from '@app/components';
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
import { PassphraseDialogComponent } from '@app/components/app-header/passphrase-dialog.component'

@NgModule({
  declarations: [
    AppComponent,
    LoreArticleComponent,
    LoreArticleEditorComponent,
    ArticlePageComponent,
    AppHeaderComponent,
    PassphraseDialogComponent,
    MarkdownPipe,
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
    MatListModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
