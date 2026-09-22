import { Component, effect, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContentAccessTag, ContentAccessTagId } from '@app/models';
import { StateService } from '@app/services';

type AccessTagForm = FormGroup<{
  id: FormControl<ContentAccessTagId>;
  name: FormControl<string>;
}>;

@Component({
  selector: 'app-edit-tags-page',
  standalone: false,
  templateUrl: './edit-tags-page.component.html',
})
export class EditTagsPageComponent {
  private readonly stateService: StateService = inject(StateService);
  private readonly router: Router = inject(Router);
  private readonly matSnackBar: MatSnackBar = inject(MatSnackBar);

  protected readonly authorizedAsOwner = this.stateService.authorizedAsOwner;
  protected readonly tags = new FormArray<AccessTagForm>(
    (this.stateService.state.ownerData?.accessTags ?? []).map((tag) => this.createTagForm(tag)),
  );
  protected readonly form = new FormGroup({ tags: this.tags });

  constructor() {
    effect(() => {
      if (!this.authorizedAsOwner()) {
        this.router.navigate(['/']);
      }
    });
  }

  protected addTag(): void {
    this.tags.push(this.createTagForm({ id: crypto.randomUUID(), name: '' }));
  }

  protected isTagInUse(id: ContentAccessTagId): boolean {
    return this.stateService.isAccessTagInUse(id);
  }

  protected removeTag(index: number): void {
    if (this.isTagInUse(this.tags.at(index).controls.id.value)) {
      this.matSnackBar.open('Tags in use cannot be deleted.', 'Dismiss', { duration: 5000 });
    } else {
      this.tags.removeAt(index);
    }
  }

  protected save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    if (this.stateService.setAccessTags(this.tags.getRawValue())) {
      this.cancel();
    } else {
      this.matSnackBar.open(
        'Tags could not be saved. Check that tags in use have not been removed.',
        'Dismiss',
        { duration: 5000 },
      );
    }
  }

  protected cancel(): void {
    this.router.navigate(['/']);
  }

  private createTagForm(tag: ContentAccessTag): AccessTagForm {
    return new FormGroup({
      id: new FormControl(tag.id, { nonNullable: true }),
      name: new FormControl(tag.name, {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/\S/)],
      }),
    });
  }
}
