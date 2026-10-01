import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { OWNER_USERNAME } from '@app/models';
import { StateService } from '@app/services';
import { routeParamSignal } from '@app/signals';
import { DeleteUserDialogComponent } from '@app/pages';

@Component({
  selector: 'app-edit-user-page',
  standalone: false,
  templateUrl: './edit-user-page.component.html',
  styleUrl: './edit-user-page.component.scss',
})
export class EditUserPageComponent {
  private readonly stateService: StateService = inject(StateService);
  private readonly router: Router = inject(Router);
  private readonly matDialog: MatDialog = inject(MatDialog);
  private readonly matSnackBar: MatSnackBar = inject(MatSnackBar);
  protected readonly userId = routeParamSignal<string>('id');
  protected readonly user = computed(() =>
    this.stateService.users().find((user) => user.id === this.userId()),
  );
  protected readonly authorizedAsOwner = this.stateService.authorizedAsOwner;
  protected readonly isOwner = computed(() => this.user()?.name === OWNER_USERNAME);
  protected readonly tags = computed(() => this.stateService.state.ownerData?.accessTags ?? []);
  protected readonly busy = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    password: new FormControl('', { nonNullable: true }),
    access: new FormControl<string[]>([], { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      if (!this.authorizedAsOwner()) {
        this.router.navigate(['/']);
      }
    });
    effect(() => {
      const user = this.user();
      this.form.reset({ name: user?.name ?? '', password: '', access: [...(user?.access ?? [])] });
      if (this.isOwner()) {
        this.form.controls.name.disable();
      } else {
        this.form.controls.name.enable();
      }
      if (this.userId()) {
        this.form.controls.password.clearValidators();
      } else {
        this.form.controls.password.setValidators([Validators.required, Validators.pattern(/\S/)]);
      }
      this.form.controls.password.updateValueAndValidity();
      this.showPassword.set(false);
    });
  }

  protected async save(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy()) {
      return;
    }
    const existing = this.user();
    if (this.userId() && !existing) {
      this.showError('This user no longer exists.');
      return;
    }
    const draft = this.form.getRawValue();
    this.busy.set(true);
    try {
      await this.stateService.saveUser(
        {
          id: existing?.id ?? crypto.randomUUID(),
          name: draft.name,
          password: draft.password === '' ? (existing?.password ?? '') : draft.password,
          access: draft.access,
        },
        !this.userId(),
      );
      this.matSnackBar.open('User saved.', 'Dismiss', { duration: 3000 });
      await this.router.navigate(['/users']);
    } catch (error) {
      this.showError(error instanceof Error ? error.message : 'User could not be saved. Please try again.');
    } finally {
      this.busy.set(false);
    }
  }

  protected async remove(): Promise<void> {
    const user = this.user();
    if (!user || this.isOwner() || this.busy()) {
      return;
    }
    this.busy.set(true);
    try {
      const confirmed = await firstValueFrom(
        this.matDialog
          .open(DeleteUserDialogComponent, {
            data: { name: user.name },
            width: '440px',
          })
          .afterClosed(),
      );
      if (confirmed === true) {
        await this.stateService.removeUser(user.id);
        this.matSnackBar.open('User deleted.', 'Dismiss', { duration: 3000 });
        await this.router.navigate(['/users']);
      }
    } catch (error) {
      this.showError(
        error instanceof Error ? error.message : 'User could not be deleted. Please try again.',
      );
    } finally {
      this.busy.set(false);
    }
  }

  private showError(message: string): void {
    this.matSnackBar.open(message, 'Dismiss', { duration: 5000 });
  }
}
