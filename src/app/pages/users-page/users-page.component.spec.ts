import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { provideRouter, RouterLink } from '@angular/router';
import { StateService } from '@app/services';
import { UsersPageComponent } from '@app/pages/users-page/users-page.component';

describe('UsersPageComponent', () => {
  it('marks the existing uppercase OWNER account as owner and lists it first', async () => {
    await TestBed.configureTestingModule({
      declarations: [UsersPageComponent],
      imports: [RouterLink, MatButtonModule, MatCardModule, MatChipsModule, MatIconModule],
      providers: [
        provideRouter([]),
        {
          provide: StateService,
          useValue: {
            authorizedAsOwner: signal(true),
            users: signal([
              { id: 'reader', name: 'Alice', password: 'reader-secret', access: ['tag'] },
              { id: 'owner', name: 'OWNER', password: 'owner-secret', access: [] },
            ]),
            state: { ownerData: { accessTags: [{ id: 'tag', name: 'Private' }] } },
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const cards = element.querySelectorAll('mat-card');
    expect(cards[0].querySelector('mat-card-title')?.textContent).toContain('OWNER');
    expect(cards[0].querySelector('mat-card-subtitle')?.textContent).toContain('Owner · Full access');
    expect(cards[0].querySelector('mat-chip-set')).toBeNull();
    expect(cards[1].querySelector('mat-card-subtitle')?.textContent?.trim()).toBe('User');
    expect(cards[1].querySelector('mat-chip')?.textContent).toContain('Private');
  });
});
