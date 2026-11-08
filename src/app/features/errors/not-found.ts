import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CityService } from '../../core/services/city.service';
import { ExchangeService } from '../../core/services/exchange.service';
import { WeatherService } from '../../core/services/weather.service';
import { weatherInfo } from '../../core/utils/weather-codes';
import { CitySearch } from '../../shared/components/city-search';
import { Flag } from '../../shared/components/flag';
import { Icon } from '../../shared/components/icon';

/** Tela 10: página não encontrada (404). */
@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CitySearch, Flag, Icon],
  template: `
    <div class="flex flex-col items-center py-6 text-center lg:py-10">
      <div class="relative flex items-center gap-3 text-[7rem] leading-none font-extrabold tracking-tighter text-brand-600 sm:text-[9rem]">
        <span>4</span>
        <span class="grid size-24 place-items-center rounded-full bg-sun-400 text-white shadow-lg shadow-sun-500/30 sm:size-32">
          <app-icon name="compass" [size]="64" [stroke]="1.6" />
        </span>
        <span>4</span>
      </div>
      <h1 class="mt-6 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">Parece que você se perdeu</h1>
      <p class="mt-3 max-w-lg text-lg text-slate-500">
        A página que você procura não existe ou mudou de endereço. Que tal escolher um novo destino?
      </p>

      <div class="mt-8 w-full max-w-xl text-left">
        <app-city-search placeholder="Buscar uma cidade" (selected)="go()" />
      </div>
      <div class="mt-4 flex flex-wrap justify-center gap-3">
        <a routerLink="/" class="btn btn-primary"><app-icon name="house" [size]="17" /> Ir para o início</a>
        <a routerLink="/viagens" class="btn btn-secondary"><app-icon name="luggage" [size]="17" /> Minhas viagens</a>
      </div>
    </div>

    <section class="mt-6">
      <h2 class="mb-4 flex items-center gap-2 font-bold text-navy-900">
        <app-icon name="star" [size]="18" class="text-sun-500" /> Destinos populares no Skyfare
      </h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        @for (d of destinations; track d.id) {
          <a routerLink="/" class="card flex items-center gap-4 p-4 transition-shadow hover:shadow-lg">
            <app-flag [code]="d.codigoPais" [size]="40" />
            <div class="min-w-0 flex-1">
              <p class="truncate font-bold text-navy-900">{{ d.nome }}</p>
              <p class="truncate text-xs text-slate-500">{{ d.pais }}</p>
              <p class="mt-1 text-xs font-semibold text-sun-600">{{ d.cotacao }}</p>
            </div>
            <div class="text-right">
              <app-icon [name]="d.icone" [size]="26" [stroke]="1.6" class="text-brand-600" />
              <p class="text-sm font-bold text-navy-900">{{ d.temperatura }}°</p>
            </div>
          </a>
        }
      </div>
    </section>
  `,
})
export class NotFound {
  private readonly router = inject(Router);
  private readonly cities = inject(CityService);
  private readonly weatherService = inject(WeatherService);
  private readonly exchange = inject(ExchangeService);

  protected readonly destinations = ['Edimburgo', 'Lisboa', 'Tóquio', 'Buenos Aires'].flatMap((nome) => {
    const city = this.cities.getByName(nome);
    if (!city) return [];
    const weather = this.weatherService.getByCity(city.id);
    const rate = this.exchange.getRate(this.exchange.currencyOf(city.codigoPais));
    const valor = !rate ? '' : rate.cotacao < 0.1 ? rate.cotacao.toFixed(4) : rate.cotacao.toFixed(2);
    return {
      ...city,
      temperatura: weather.atual.temperatura,
      icone: weatherInfo(weather.atual.codigo).icone,
      cotacao: rate ? `1 ${rate.codigo} = R$ ${valor.replace('.', ',')}` : '',
    };
  });

  protected go() {
    this.router.navigateByUrl('/');
  }
}
