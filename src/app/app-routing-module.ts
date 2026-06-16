import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  ArticleEditorComponent,
  ArticleListComponent,
  LayoutWithNavComponent,
  LayoutWithoutNavComponent
} from '@app/components';
import { HasBundleGuard } from '@app/guards';
import { LoadBundlePage, ViewArticlePageComponent } from '@app/pages';

const routes: Routes = [
  {
    path: '',
    component: LayoutWithNavComponent,
    children: [
      { path: '', component: ArticleListComponent, canActivate: [HasBundleGuard] },
      { path: 'article/:id', component: ViewArticlePageComponent, canActivate: [HasBundleGuard] },
      { path: 'edit/:id', component: ArticleEditorComponent, canActivate: [HasBundleGuard] },
      { path: 'create', component: ArticleEditorComponent, canActivate: [HasBundleGuard] },
    ]
  },
  {
    path: '',
    component: LayoutWithoutNavComponent,
    children: [
      { path: 'loadBundle', component: LoadBundlePage },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
