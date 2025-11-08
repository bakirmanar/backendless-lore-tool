import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { LoreCardComponent } from './lore-card.component';
import { LoreSectionAccess } from '../../models';

describe('LoreCard', () => {
  let component: LoreCardComponent;
  let fixture: ComponentFixture<LoreCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [LoreCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoreCardComponent);
    component = fixture.componentInstance;
    component.card = { id: '1', title: 'Sample', sections: [{ access: LoreSectionAccess.PUBLIC, text: 'hello' }] } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
