import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  LoreArticleEditorComponent,
  ArticlePageComponent,
  ArticleListComponent,
  LayoutWithNavComponent
} from '@app/components';

const routes: Routes = [
  // {
  //   path: '',
  //   component: LayoutWithoutNavComponent,
  //   children: [
  //     { path: 'login', component: LoginComponent },
  //   ]
  // },
  {
    path: '',
    component: LayoutWithNavComponent,
    children: [
      { path: '', component: ArticleListComponent },
      { path: 'article/:id', component: ArticlePageComponent },
      { path: 'edit/:id', component: LoreArticleEditorComponent },
      { path: 'create', component: LoreArticleEditorComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
