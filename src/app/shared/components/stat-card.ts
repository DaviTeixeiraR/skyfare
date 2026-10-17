import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon, IconName } from './icon';

@Component({
  selector: 'app-stat-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: { class: 'card flex items-start gap-4 p-5' },
  template: `
    <div class="grid size-11 shrink-0 place-items-center rounded-xl" [class]="tone()">
      <app-icon [name]="icon()" [size]="22" />
    </div>
    <div class="min-w-0">
      <p class="text-sm font-medium text-slate-500">{{ label() }}</p>
      <p class="mt-0.5 truncate text-2xl font-bold tracking-tight text-navy-900">{{ value() }}</p>
      @if (hint()) {
        <p class="mt-1 text-xs text-slate-500">{{ hint() }}</p>
      }
    </div>
  `,
})
export class StatCard {
  readonly icon = input.required<IconName>();
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly hint = input('');
  readonly tone = input('bg-brand-50 text-brand-600');
}
