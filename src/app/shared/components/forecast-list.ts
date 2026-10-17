import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DailyForecast } from '../../core/models';
import { weatherInfo } from '../../core/utils/weather-codes';
import { Icon } from './icon';

/** Previsão dos próximos 7 dias. */
@Component({
  selector: 'app-forecast-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, DatePipe],
  host: { class: 'card block p-6' },
  template: `
    <div class="mb-4 flex items-center justify-between">
      <h3 class="flex items-center gap-2 font-bold text-navy-900">
        <app-icon name="calendar-days" [size]="18" class="text-brand-600" /> Próximos 7 dias
      </h3>
      <span class="text-xs text-slate-400">Máx. / mín. e chance de chuva</span>
    </div>
    <ul class="grid grid-cols-7 gap-2">
      @for (day of days(); track day.data; let first = $first) {
        <li
          class="flex flex-col items-center gap-1.5 rounded-xl px-1 py-3 text-center"
          [class]="first ? 'bg-brand-50 ring-1 ring-brand-100' : 'bg-slate-50'"
        >
          <span class="text-xs font-semibold capitalize" [class]="first ? 'text-brand-700' : 'text-slate-500'">
            {{ first ? 'Hoje' : (day.data + 'T12:00:00' | date: 'EEE') }}
          </span>
          <app-icon [name]="icon(day.codigo)" [size]="26" [stroke]="1.6" class="text-brand-600" />
          <span class="text-sm font-bold text-navy-900">{{ day.maxima }}°</span>
          <span class="text-xs text-slate-400">{{ day.minima }}°</span>
          <span class="flex items-center gap-0.5 text-[11px] font-medium text-sky-600">
            <app-icon name="droplets" [size]="11" />{{ day.chuva }}%
          </span>
        </li>
      }
    </ul>
  `,
})
export class ForecastList {
  readonly days = input.required<DailyForecast[]>();

  protected icon(codigo: number) {
    return weatherInfo(codigo).icone;
  }
}
