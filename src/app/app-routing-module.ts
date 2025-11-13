import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoreArticleEditorComponent, ArticlePageComponent } from '@app/components';

const routes: Routes = [
  { path: 'article/:id', component: ArticlePageComponent },
  { path: 'edit/:id', component: LoreArticleEditorComponent },
  { path: 'create', component: LoreArticleEditorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
