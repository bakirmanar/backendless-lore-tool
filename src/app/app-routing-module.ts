import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  ArticleListComponent,
  LayoutWithNavComponent,
  LayoutWithoutNavComponent
} from '@app/components';
import { HasBundleGuard } from '@app/guards';
import { EditArticlePageComponent, LoadBundlePage, ViewArticlePageComponent } from '@app/pages';

const routes: Routes = [
  {
    path: '',
    component: LayoutWithNavComponent,
    children: [
      { path: '', component: ArticleListComponent, canActivate: [HasBundleGuard] },
      { path: 'article/:id', component: ViewArticlePageComponent, canActivate: [HasBundleGuard] },
      { path: 'edit/:id', component: EditArticlePageComponent, canActivate: [HasBundleGuard] },
      { path: 'create', component: EditArticlePageComponent, canActivate: [HasBundleGuard] },
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
