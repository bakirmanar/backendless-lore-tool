import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoreArticleEditorComponent } from '@app/components';

const routes: Routes = [
  { path: 'edit/:id', component: LoreArticleEditorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
