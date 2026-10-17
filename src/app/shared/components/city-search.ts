import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { CIDADES } from '../../core/mock/mock-data';
import { City } from '../../core/models';
import { Flag } from './flag';
import { Icon } from './icon';

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/**
 * Busca de cidade com sugestões. No protótipo filtra uma lista fixa;
 * no desenvolvimento passa a usar a Open-Meteo Geocoding (debounceTime + switchMap).
 */
@Component({
  selector: 'app-city-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, Flag],
  host: { class: 'relative block' },
  template: `
    <label class="relative block">
      <span class="sr-only">Buscar cidade</span>
      <app-icon name="search" [size]="20" class="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        autocomplete="off"
        [placeholder]="placeholder()"
        class="w-full rounded-2xl border border-slate-200 bg-white py-4 pr-4 pl-12 text-base font-medium text-navy-900 shadow-sm placeholder:font-normal placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none"
        [class.!py-3]="compact()"
        [value]="query()"
        (input)="onInput($any($event.target).value)"
        (focus)="open.set(true)"
        (blur)="close()"
        (keydown.escape)="open.set(false)"
      />
    </label>

    @if (open() && suggestions().length) {
      <ul
        class="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl shadow-navy-900/10"
        role="listbox"
      >
        @for (city of suggestions(); track city.id) {
          <li>
            <button
              type="button"
              class="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-brand-50"
              (mousedown)="select(city)"
            >
              <app-flag [code]="city.codigoPais" [size]="26" />
              <span class="min-w-0 flex-1">
                <span class="block truncate font-semibold text-navy-900">{{ city.nome }}</span>
                <span class="block truncate text-sm text-slate-500">{{ city.estado }}, {{ city.pais }}</span>
              </span>
              <app-icon name="chevron-right" [size]="16" class="text-slate-300" />
            </button>
          </li>
        }
      </ul>
    }
  `,
})
export class CitySearch {
  readonly placeholder = input('Para onde você vai? Digite uma cidade');
  readonly compact = input(false);
  readonly initial = input('');
  readonly selected = output<City>();

  protected readonly query = linkedSignal(() => this.initial());
  protected readonly open = signal(false);

  protected readonly suggestions = computed(() => {
    const q = normalize(this.query());
    if (q.length < 2) return [];
    return CIDADES.filter((c) => normalize(c.nome).startsWith(q)).slice(0, 6);
  });

  protected onInput(value: string) {
    this.query.set(value);
    this.open.set(true);
  }

  protected select(city: City) {
    this.query.set(city.nome);
    this.open.set(false);
    this.selected.emit(city);
  }

  protected close() {
    setTimeout(() => this.open.set(false), 120);
  }
}
