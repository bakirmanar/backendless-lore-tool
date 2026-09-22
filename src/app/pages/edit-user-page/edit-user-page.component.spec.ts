import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, provideRouter, Router, RouterLink } from '@angular/router';
import { User, OWNER_USERNAME } from '@app/models';
import { StateService } from '@app/services';
import { BehaviorSubject, of } from 'rxjs';
import { EditUserPageComponent } from './edit-user-page.component';

describe('EditUserPageComponent', () => {
  let fixture: ComponentFixture<EditUserPageComponent>;
  let element: HTMLElement;
  let params: BehaviorSubject<{ id?: string }>;
  let saveUser: jasmine.Spy;
  let removeUser: jasmine.Spy;
  let matDialog: jasmine.SpyObj<MatDialog>;
  // Match existing bundles independently of the application constant.
  const owner: User = { id: 'owner', name: 'OWNER', password: 'owner-secret', access: [] };
  const reader: User = { id: 'reader', name: 'Reader', password: 'reader-secret', access: ['tag'] };

  beforeEach(async () => {
    params = new BehaviorSubject<{ id?: string }>({ id: 'reader' });
    saveUser = jasmine.createSpy('saveUser').and.resolveTo();
    removeUser = jasmine.createSpy('removeUser').and.resolveTo();
    matDialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    await TestBed.configureTestingModule({
      declarations: [EditUserPageComponent],
      imports: [
        ReactiveFormsModule,
        RouterLink,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
      ],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: ActivatedRoute, useValue: { params, snapshot: { params: params.value } } },
        { provide: MatDialog, useValue: matDialog },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        {
          provide: StateService,
          useValue: {
            authorizedAsOwner: signal(true),
            users: signal([owner, reader]),
            state: {
              currentUser: owner,
              ownerData: { accessTags: [{ id: 'tag', name: 'Private' }] },
            },
            saveUser,
            removeUser,
          },
        },
      ],
    }).compileComponents();
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(EditUserPageComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('disables the owner username and hides tag editing and deletion', () => {
    params.next({ id: 'owner' });
    fixture.detectChanges();
    expect(element.querySelector('mat-select')).toBeNull();
    expect(element.querySelector('.delete-user')).toBeNull();
    expect(element.querySelector<HTMLInputElement>('input[formControlName="name"]')!.value).toBe(
      OWNER_USERNAME,
    );
    expect(element.querySelector<HTMLInputElement>('input[formControlName="name"]')!.disabled).toBeTrue();
    params.next({ id: 'reader' });
    fixture.detectChanges();
    expect(element.querySelector<HTMLInputElement>('input[formControlName="name"]')!.disabled).toBeFalse();
  });

  it('includes the disabled owner username when saving a password change', async () => {
    params.next({ id: 'owner' });
    fixture.detectChanges();
    const password = element.querySelector<HTMLInputElement>('input[formControlName="password"]')!;
    password.value = 'changed-secret';
    password.dispatchEvent(new Event('input'));
    element.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();
    expect(saveUser).toHaveBeenCalledWith({ ...owner, password: 'changed-secret' }, false);
  });

  it('keeps the existing password when saving with a blank password field', async () => {
    element.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();
    expect(saveUser).toHaveBeenCalledWith(reader, false);
  });

  it('requires a password when creating a user', async () => {
    params.next({});
    fixture.detectChanges();
    const input = element.querySelector<HTMLInputElement>('input[formControlName="name"]')!;
    input.value = 'New user';
    input.dispatchEvent(new Event('input'));
    element.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();
    expect(saveUser).not.toHaveBeenCalled();
  });

  it('only deletes after an affirmative confirmation', async () => {
    matDialog.open.and.returnValue({ afterClosed: () => of(false) } as ReturnType<
      MatDialog['open']
    >);
    element.querySelector<HTMLButtonElement>('.delete-user')!.click();
    await fixture.whenStable();
    expect(removeUser).not.toHaveBeenCalled();
    matDialog.open.and.returnValue({ afterClosed: () => of(true) } as ReturnType<
      MatDialog['open']
    >);
    element.querySelector<HTMLButtonElement>('.delete-user')!.click();
    await fixture.whenStable();
    expect(removeUser).toHaveBeenCalledWith('reader');
  });

  it('shows a missing-user state instead of a create form for an invalid ID', () => {
    params.next({ id: 'missing' });
    fixture.detectChanges();
    expect(element.textContent).toContain('User not found');
    expect(element.querySelector('form')).toBeNull();
  });
});
