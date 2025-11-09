import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { AppComponent } from './app.component';
import { LoreArticleComponent, LoreArticleEditorComponent } from '@app/components';
import { ReactiveFormsModule } from '@angular/forms'
import { MarkdownPipe } from '@app/pipes';

@NgModule({
  declarations: [
    AppComponent,
    LoreArticleComponent,
    LoreArticleEditorComponent,
    MarkdownPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
