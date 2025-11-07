import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { AppComponent } from './app.component';
import { LoreCardComponent } from './components/lore-card/lore-card.component';
import { ReactiveFormsModule } from '@angular/forms'
import { MarkdownPipe } from './pipes/markdown.pipe';

@NgModule({
  declarations: [
    AppComponent,
    LoreCardComponent,
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
