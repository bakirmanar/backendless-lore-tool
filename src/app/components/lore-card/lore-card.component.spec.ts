import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoreCardComponent } from './lore-card.component';

describe('LoreCard', () => {
  let component: LoreCardComponent;
  let fixture: ComponentFixture<LoreCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoreCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoreCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
