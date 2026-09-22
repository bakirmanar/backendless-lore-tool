import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  ArticleListComponent,
  LayoutWithNavComponent,
  LayoutWithoutNavComponent
} from '@app/components';
import { HasBundleGuard, OwnerGuard } from '@app/guards';
import { EditArticlePageComponent, EditTagsPageComponent, LoadBundlePage, ViewArticlePageComponent } from '@app/pages';

const routes: Routes = [
  {
    path: '',
    component: LayoutWithNavComponent,
    children: [
      { path: '', component: ArticleListComponent, canActivate: [HasBundleGuard] },
      { path: 'article/:id', component: ViewArticlePageComponent, canActivate: [HasBundleGuard] },
      { path: 'edit/:id', component: EditArticlePageComponent, canActivate: [HasBundleGuard, OwnerGuard] },
      { path: 'tags', component: EditTagsPageComponent, canActivate: [HasBundleGuard, OwnerGuard] },
      { path: 'create', component: EditArticlePageComponent, canActivate: [HasBundleGuard, OwnerGuard] },
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
