import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadBundlePage } from './load-bundle.page';

describe('LoadBundlePage', () => {
  let component: LoadBundlePage;
  let fixture: ComponentFixture<LoadBundlePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoadBundlePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadBundlePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
