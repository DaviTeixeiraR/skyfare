import { IconName } from '../../shared/components/icon';

export interface WeatherInfo {
  descricao: string;
  icone: IconName;
  tema: 'sol' | 'nuvem' | 'chuva' | 'neve' | 'tempestade';
}

/** Tradução dos códigos WMO usados pela Open-Meteo. */
export function weatherInfo(codigo: number): WeatherInfo {
  if (codigo === 0) return { descricao: 'Céu limpo', icone: 'sun', tema: 'sol' };
  if (codigo <= 2) return { descricao: 'Parcialmente nublado', icone: 'cloud-sun', tema: 'sol' };
  if (codigo === 3) return { descricao: 'Nublado', icone: 'cloud', tema: 'nuvem' };
  if (codigo === 45 || codigo === 48) return { descricao: 'Neblina', icone: 'cloud-fog', tema: 'nuvem' };
  if (codigo >= 51 && codigo <= 57) return { descricao: 'Garoa', icone: 'cloud-drizzle', tema: 'chuva' };
  if (codigo >= 61 && codigo <= 67) return { descricao: 'Chuva', icone: 'cloud-rain', tema: 'chuva' };
  if (codigo >= 71 && codigo <= 77) return { descricao: 'Neve', icone: 'cloud-snow', tema: 'neve' };
  if (codigo >= 80 && codigo <= 82) return { descricao: 'Pancadas de chuva', icone: 'cloud-rain', tema: 'chuva' };
  if (codigo === 85 || codigo === 86) return { descricao: 'Pancadas de neve', icone: 'cloud-snow', tema: 'neve' };
  if (codigo >= 95) return { descricao: 'Trovoada', icone: 'cloud-lightning', tema: 'tempestade' };
  return { descricao: 'Indefinido', icone: 'cloud', tema: 'nuvem' };
}

/** Gradiente do cartão de clima conforme o tempo. */
export const WEATHER_GRADIENT: Record<WeatherInfo['tema'], string> = {
  sol: 'from-sky-400 via-brand-500 to-brand-700',
  nuvem: 'from-slate-400 via-slate-500 to-navy-700',
  chuva: 'from-brand-700 via-navy-700 to-navy-900',
  neve: 'from-sky-200 via-sky-400 to-brand-600',
  tempestade: 'from-navy-700 via-navy-800 to-navy-900',
};
