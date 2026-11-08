import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import localePt from '@angular/common/locales/pt';
import {
  ApplicationConfig,
  DEFAULT_CURRENCY_CODE,
  importProvidersFrom,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { AppRoutingModule } from './app-routing.module';
import { errorMessage } from './core/errors';
import { CityService } from './core/services/city.service';
import { ExchangeService } from './core/services/exchange.service';
import { SearchService } from './core/services/search.service';
import { ToastService } from './core/services/toast.service';
import { TripService } from './core/services/trip.service';
import { UserService } from './core/services/user.service';
import { WeatherService } from './core/services/weather.service';

registerLocaleData(localePt);

/** Antes de abrir a primeira tela, os services buscam os dados na API (JSON-Server). */
function loadData() {
  const toast = inject(ToastService);
  return forkJoin([
    inject(UserService).load(),
    inject(TripService).load(),
    inject(CityService).load(),
    inject(ExchangeService).load(),
    inject(WeatherService).load(),
    inject(SearchService).load(),
  ]).pipe(
    catchError((e) => {
      toast.error(errorMessage(e, 'Não foi possível carregar os dados da API.'));
      return of(null);
    }),
  );
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideAppInitializer(loadData),
    importProvidersFrom(AppRoutingModule),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
  ],
};
