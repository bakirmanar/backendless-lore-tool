import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { StateService } from '@app/services';
import { EditTagsPageComponent } from './edit-tags-page.component';

describe('EditTagsPageComponent', () => {
  let fixture: ComponentFixture<EditTagsPageComponent>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    matSnackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    await TestBed.configureTestingModule({
      declarations: [EditTagsPageComponent],
      imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
      ],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: MatSnackBar, useValue: matSnackBar },
        {
          provide: StateService,
          useValue: {
            authorizedAsOwner: signal(true),
            state: { ownerData: { accessTags: [{ id: 'tag', name: 'Used tag' }] } },
            isAccessTagInUse: () => true,
            setAccessTags: () => false,
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(EditTagsPageComponent);
    fixture.detectChanges();
  });

  it('shows a toast and retains a tag when deletion is blocked', () => {
    const element: HTMLElement = fixture.nativeElement;
    element.querySelector<HTMLButtonElement>('button[aria-label="Delete tag Used tag"]')!.click();
    fixture.detectChanges();
    expect(matSnackBar.open).toHaveBeenCalledWith(
      'Tags in use cannot be deleted.', 'Dismiss', { duration: 5000 },
    );
    expect(element.querySelector<HTMLInputElement>('input')!.value).toBe('Used tag');
  });

  it('shows a toast when saving is rejected', () => {
    const element: HTMLElement = fixture.nativeElement;
    element.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    expect(matSnackBar.open).toHaveBeenCalledWith(
      'Tags could not be saved. Check that tags in use have not been removed.',
      'Dismiss',
      { duration: 5000 },
    );
  });
});
