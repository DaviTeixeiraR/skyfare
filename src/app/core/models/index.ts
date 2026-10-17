export type Perfil = 'usuario' | 'admin';

export interface User {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
  ativo: boolean;
  criadoEm: string; // ISO
  viagens: number;
}

/** Cidade devolvida pela Open-Meteo Geocoding. */
export interface City {
  id: number;
  nome: string;
  estado: string;
  pais: string;
  codigoPais: string; // ISO 3166-1 alfa-2
  latitude: number;
  longitude: number;
}

export type Continente =
  | 'Europa'
  | 'América do Sul'
  | 'América do Norte'
  | 'Ásia'
  | 'África'
  | 'Oceania';

/** Viagem salva no JSON-Server (coleção trips). */
export interface Trip {
  id: number;
  userId: number;
  cityId: number;
  cidade: string;
  estado: string;
  pais: string;
  codigoPais: string;
  continente: Continente;
  moeda: string;
  dataIda: string; // ISO (aaaa-mm-dd)
  dataVolta: string;
  orcamentoBRL: number;
  observacoes: string;
}

export interface CurrentWeather {
  temperatura: number;
  sensacao: number;
  umidade: number;
  vento: number;
  codigo: number; // código WMO
  maxima: number;
  minima: number;
}

export interface DailyForecast {
  data: string; // ISO
  codigo: number;
  maxima: number;
  minima: number;
  chuva: number; // probabilidade em %
}

export interface Weather {
  atual: CurrentWeather;
  diario: DailyForecast[];
}

/** Cotação da AwesomeAPI combinada com os dados da moeda da REST Countries. */
export interface ExchangeRate {
  codigo: string;
  nome: string;
  simbolo: string;
  cotacao: number; // valor de 1 unidade em reais
  variacao: number; // variação do dia em %
  atualizadoEm: string;
  historico: number[]; // últimos 30 dias
}
