import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { City } from '../../core/models';
import { CityService } from '../../core/services/city.service';
import { ExchangeService } from '../../core/services/exchange.service';
import { SearchService } from '../../core/services/search.service';
import { WeatherService } from '../../core/services/weather.service';
import { CitySearch } from '../../shared/components/city-search';
import { ExchangeCard } from '../../shared/components/exchange-card';
import { Flag } from '../../shared/components/flag';
import { ForecastList } from '../../shared/components/forecast-list';
import { Icon } from '../../shared/components/icon';
import { WeatherCard } from '../../shared/components/weather-card';

/** Tela 3: busca rápida (página inicial). */
@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CitySearch, WeatherCard, ExchangeCard, ForecastList, Flag, Icon],
  template: `
    <section class="relative mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-brand-700 to-navy-900 px-6 pt-12 pb-20 text-white sm:px-10">
      <div class="pointer-events-none absolute -top-20 -right-20 size-40 rounded-full bg-sun-400/90 sm:-top-16 sm:right-10 sm:size-56"></div>
      <div class="pointer-events-none absolute top-24 right-0 h-16 w-72 rounded-full bg-white/15 blur-sm"></div>
      <div class="pointer-events-none absolute top-36 right-40 h-10 w-48 rounded-full bg-white/10 blur-sm"></div>

      <div class="relative max-w-2xl">
        <p class="text-sm font-semibold tracking-wide text-brand-100 uppercase">Busca rápida</p>
        <h1 class="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">Para onde vamos?</h1>
        <p class="mt-3 text-lg text-brand-100">
          Veja o clima e a cotação da moeda local de qualquer cidade do mundo.
        </p>
      </div>
    </section>

    <div class="relative z-10 mx-auto -mt-20 max-w-3xl">
      <app-city-search [initial]="city()?.nome ?? ''" (selected)="choose($event)" />
      <div class="mt-3 flex flex-wrap items-center gap-2 px-1 text-sm">
        <span class="flex items-center gap-1 text-slate-500"><app-icon name="history" [size]="15" /> Recentes:</span>
        @for (s of searches.recent(); track s.id) {
          <button type="button" (click)="pick(s.cityId)"
                  class="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-600 hover:border-brand-300 hover:text-brand-700"
                  [class.!border-brand-300]="s.cityId === city()?.id" [class.!text-brand-700]="s.cityId === city()?.id">
            {{ s.cidade }}
          </button>
        } @empty {
          <span class="text-slate-400">nenhuma busca ainda</span>
        }
      </div>
    </div>

    @if (city(); as city) {
    <section class="mt-10">
      <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <app-flag [code]="city.codigoPais" [size]="40" />
          <div>
            <h2 class="text-2xl font-extrabold tracking-tight text-navy-900">{{ city.nome }}</h2>
            <p class="flex items-center gap-1 text-sm text-slate-500">
              <app-icon name="map-pin" [size]="14" /> {{ city.estado }}, {{ city.pais }}
            </p>
          </div>
        </div>
        <div class="flex gap-2">
          <button type="button" class="btn btn-secondary" (click)="favorite.set(!favorite())">
            <app-icon name="star" [size]="17" [fill]="favorite() ? 'currentColor' : 'none'" [class]="favorite() ? 'text-sun-500' : ''" />
            {{ favorite() ? 'Favorita' : 'Favoritar' }}
          </button>
          <a routerLink="/viagens/nova" [queryParams]="{ cidade: city.id }" class="btn btn-primary"><app-icon name="plus" [size]="17" /> Salvar como viagem</a>
        </div>
      </div>

      <div class="grid gap-5 lg:grid-cols-2">
        <app-weather-card [weather]="weather()" />
        <app-exchange-card [rate]="rate()" [domestic]="currency() === 'BRL'" [showConverter]="true" />
      </div>
      <app-forecast-list class="mt-5" [days]="weather().diario" />
    </section>
    }
  `,
})
export class Home {
  private readonly cities = inject(CityService);
  private readonly weatherService = inject(WeatherService);
  private readonly exchange = inject(ExchangeService);
  protected readonly searches = inject(SearchService);

  /** Começa pela última cidade pesquisada (ou Edimburgo, se o histórico estiver vazio). */
  protected readonly city = signal<City | undefined>(
    this.cities.getById(this.searches.recent()[0]?.cityId ?? 2650225),
  );
  protected readonly favorite = signal(true);

  protected readonly weather = computed(() => this.weatherService.getByCity(this.city()?.id ?? 0));
  protected readonly currency = computed(() => this.exchange.currencyOf(this.city()?.codigoPais ?? ''));
  protected readonly rate = computed(() => this.exchange.getRate(this.currency()));

  /** Mostra a cidade escolhida e grava a busca no histórico da API. */
  protected choose(city: City) {
    this.city.set(city);
    this.searches.register(city).subscribe({ error: () => undefined });
  }

  protected pick(cityId: number) {
    const found = this.cities.getById(cityId);
    if (found) this.choose(found);
  }
}
