import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Article } from '@app/models';

import { ArticleViewerComponent } from './article-viewer.component';

describe('ArticleViewerComponent', () => {
  let component: ArticleViewerComponent;
  let fixture: ComponentFixture<ArticleViewerComponent>;
  const article: Article = {
    id: '1',
    title: 'Sample',
    accessTags: [],
    sections: [{ id: 'section-1', accessTags: [], content: 'hello' }],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatSidenavModule],
      declarations: [ArticleViewerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleViewerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('article', article);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
