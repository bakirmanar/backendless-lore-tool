import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { LoreArticleComponent } from './lore-article.component';
import { LoreSectionAccess } from '@app/models';

describe('LoreArticle', () => {
  let component: LoreArticleComponent;
  let fixture: ComponentFixture<LoreArticleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [LoreArticleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoreArticleComponent);
    component = fixture.componentInstance;
    component.article = { id: '1', title: 'Sample', sections: [{ access: LoreSectionAccess.PUBLIC, text: 'hello' }] } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


