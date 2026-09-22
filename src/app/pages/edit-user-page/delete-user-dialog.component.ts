import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-user-dialog',
  standalone: false,
  templateUrl: './delete-user-dialog.component.html',
})
export class DeleteUserDialogComponent {
  protected readonly data: { name: string } = inject(MAT_DIALOG_DATA);
}
