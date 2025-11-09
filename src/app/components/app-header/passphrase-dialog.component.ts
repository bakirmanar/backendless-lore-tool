import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-passphrase-dialog',
  standalone: false,
  template: `
    <h2 mat-dialog-title>Enter DM Passphrase</h2>
    <div mat-dialog-content>
      <mat-form-field appearance="outline" style="width:100%">
        <mat-label>Passphrase</mat-label>
        <input matInput [formControl]="pass" type="password" />
      </mat-form-field>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="pass.invalid" (click)="confirm()">Confirm</button>
    </div>
  `,
})
export class PassphraseDialogComponent {
  private readonly ref = inject(MatDialogRef<PassphraseDialogComponent>);
  pass = new FormControl<string>('', { nonNullable: true, validators: [Validators.required] });

  close() { this.ref.close(); }
  confirm() { this.ref.close(this.pass.value); }
}
