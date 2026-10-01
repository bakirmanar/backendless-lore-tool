import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CompletionOption } from '@app/models/completion.model';

@Component({
  selector: 'app-completion-panel',
  standalone: false,
  templateUrl: './completion-panel.component.html',
  styleUrl: './completion-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompletionPanelComponent {
  readonly panelId = input.required<string>();
  readonly options = input<readonly CompletionOption[]>([]);
  readonly activeIndex = input(0);
  readonly loading = input(false);
  readonly optionSelected = output<CompletionOption>();
}
