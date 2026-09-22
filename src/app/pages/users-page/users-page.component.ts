import { Component, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OWNER_USERNAME } from '@app/models';
import { StateService } from '@app/services';

@Component({
  selector: 'app-users-page',
  standalone: false,
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.scss',
})
export class UsersPageComponent {
  protected readonly stateService: StateService = inject(StateService);
  private readonly router: Router = inject(Router);
  protected readonly users = computed(() =>
    this.stateService
      .users()
      .map((user) => ({
        ...user,
        isOwner: user.name === OWNER_USERNAME,
        tags: user.access.map(
          (id) =>
            this.stateService.state.ownerData?.accessTags.find((tag) => tag.id === id)?.name
            ?? 'Unknown tag',
        ),
      }))
      .sort((first, second) => {
        if (first.isOwner !== second.isOwner) {
          return Number(second.isOwner) - Number(first.isOwner);
        } else {
          return first.name.localeCompare(second.name);
        }
      }),
  );

  constructor() {
    effect(() => {
      if (!this.stateService.authorizedAsOwner()) {
        this.router.navigate(['/']);
      }
    });
  }
}
