/*
 * Dados fictícios usados no protótipo (Trabalho 01).
 * Na etapa de desenvolvimento eles serão substituídos pelos serviços
 * que consomem as APIs (Open-Meteo, REST Countries, AwesomeAPI e JSON-Server).
 */
import { City, ExchangeRate, Trip, User, Weather } from '../models';

/** Data de referência do protótipo. */
export const HOJE = new Date(2026, 9, 18);

export const USUARIO_LOGADO: User = {
  id: 1,
  nome: 'Davi Teixeira',
  email: 'davi@skyfare.app',
  perfil: 'admin',
  ativo: true,
  criadoEm: '2026-10-18',
  viagens: 6,
};

export const CIDADES: City[] = [
  { id: 2650225, nome: 'Edimburgo', estado: 'Escócia', pais: 'Reino Unido', codigoPais: 'GB', latitude: 55.95, longitude: -3.19 },
  { id: 4688275, nome: 'Edinburg', estado: 'Texas', pais: 'Estados Unidos', codigoPais: 'US', latitude: 26.3, longitude: -98.16 },
  { id: 4257494, nome: 'Edinburgh', estado: 'Indiana', pais: 'Estados Unidos', codigoPais: 'US', latitude: 39.35, longitude: -85.97 },
  { id: 2267057, nome: 'Lisboa', estado: 'Lisboa', pais: 'Portugal', codigoPais: 'PT', latitude: 38.72, longitude: -9.14 },
  { id: 1850147, nome: 'Tóquio', estado: 'Tóquio', pais: 'Japão', codigoPais: 'JP', latitude: 35.69, longitude: 139.69 },
  { id: 3435910, nome: 'Buenos Aires', estado: 'Buenos Aires', pais: 'Argentina', codigoPais: 'AR', latitude: -34.61, longitude: -58.38 },
  { id: 3871336, nome: 'Santiago', estado: 'Região Metropolitana', pais: 'Chile', codigoPais: 'CL', latitude: -33.46, longitude: -70.65 },
  { id: 3109642, nome: 'Santiago de Compostela', estado: 'Galiza', pais: 'Espanha', codigoPais: 'ES', latitude: 42.88, longitude: -8.54 },
  { id: 2988507, nome: 'Paris', estado: 'Île-de-France', pais: 'França', codigoPais: 'FR', latitude: 48.85, longitude: 2.35 },
  { id: 4717560, nome: 'Paris', estado: 'Texas', pais: 'Estados Unidos', codigoPais: 'US', latitude: 33.66, longitude: -95.56 },
  { id: 3462315, nome: 'Gramado', estado: 'Rio Grande do Sul', pais: 'Brasil', codigoPais: 'BR', latitude: -29.38, longitude: -50.87 },
  { id: 5128581, nome: 'Nova York', estado: 'Nova York', pais: 'Estados Unidos', codigoPais: 'US', latitude: 40.71, longitude: -74.01 },
];

export const VIAGENS: Trip[] = [
  {
    id: 1, userId: 1, cityId: 2650225, cidade: 'Edimburgo', estado: 'Escócia', pais: 'Reino Unido',
    codigoPais: 'GB', continente: 'Europa', moeda: 'GBP', dataIda: '2026-12-12', dataVolta: '2026-12-20',
    orcamentoBRL: 15000, observacoes: 'Mercado de Natal, Castelo de Edimburgo e passeio pelas Highlands.',
  },
  {
    id: 2, userId: 1, cityId: 2267057, cidade: 'Lisboa', estado: 'Lisboa', pais: 'Portugal',
    codigoPais: 'PT', continente: 'Europa', moeda: 'EUR', dataIda: '2027-02-05', dataVolta: '2027-02-15',
    orcamentoBRL: 12000, observacoes: 'Bate-volta para Sintra e Cascais.',
  },
  {
    id: 3, userId: 1, cityId: 3435910, cidade: 'Buenos Aires', estado: 'Buenos Aires', pais: 'Argentina',
    codigoPais: 'AR', continente: 'América do Sul', moeda: 'ARS', dataIda: '2027-03-20', dataVolta: '2027-03-25',
    orcamentoBRL: 6500, observacoes: 'Show de tango e visita a La Boca.',
  },
  {
    id: 4, userId: 1, cityId: 1850147, cidade: 'Tóquio', estado: 'Tóquio', pais: 'Japão',
    codigoPais: 'JP', continente: 'Ásia', moeda: 'JPY', dataIda: '2027-07-10', dataVolta: '2027-07-24',
    orcamentoBRL: 28000, observacoes: 'Comprar o JR Pass antes da viagem.',
  },
  {
    id: 5, userId: 1, cityId: 3871336, cidade: 'Santiago', estado: 'Região Metropolitana', pais: 'Chile',
    codigoPais: 'CL', continente: 'América do Sul', moeda: 'CLP', dataIda: '2026-09-02', dataVolta: '2026-09-08',
    orcamentoBRL: 5800, observacoes: 'Valle Nevado e vinícolas.',
  },
  {
    id: 6, userId: 1, cityId: 3462315, cidade: 'Gramado', estado: 'Rio Grande do Sul', pais: 'Brasil',
    codigoPais: 'BR', continente: 'América do Sul', moeda: 'BRL', dataIda: '2026-06-15', dataVolta: '2026-06-19',
    orcamentoBRL: 3200, observacoes: 'Festival de inverno.',
  },
];

/** Série determinística para simular a variação da cotação em 30 dias. */
function serie(base: number, amplitude: number, fase: number): number[] {
  return Array.from({ length: 30 }, (_, i) => {
    const onda = Math.sin(i / 4 + fase) * 0.6 + Math.sin(i / 1.7 + fase * 2) * 0.25;
    const tendencia = (i - 29) * amplitude * 0.02;
    return +(base * (1 + onda * amplitude + tendencia)).toFixed(base < 0.1 ? 5 : 3);
  });
}

function cotacao(codigo: string, nome: string, simbolo: string, valor: number, variacao: number, fase: number): ExchangeRate {
  const bruta = serie(valor, 0.025, fase);
  const ajuste = valor / bruta[29];
  const historico = bruta.map((v) => +(v * ajuste).toFixed(valor < 0.1 ? 5 : 3));
  return { codigo, nome, simbolo, cotacao: valor, variacao, atualizadoEm: '18/10/2026 14:30', historico };
}

export const COTACOES: Record<string, ExchangeRate> = {
  GBP: cotacao('GBP', 'Libra esterlina', '£', 7.32, 0.42, 0.4),
  EUR: cotacao('EUR', 'Euro', '€', 6.25, -0.18, 1.3),
  USD: cotacao('USD', 'Dólar americano', 'US$', 5.45, 0.11, 2.1),
  ARS: cotacao('ARS', 'Peso argentino', '$', 0.0055, -0.95, 0.9),
  JPY: cotacao('JPY', 'Iene japonês', '¥', 0.0371, 0.27, 1.8),
  CLP: cotacao('CLP', 'Peso chileno', '$', 0.0059, 0.06, 2.6),
};

/** Moeda de cada país (no app real vem da REST Countries). */
export const MOEDA_POR_PAIS: Record<string, string> = {
  GB: 'GBP', US: 'USD', PT: 'EUR', ES: 'EUR', FR: 'EUR', JP: 'JPY', AR: 'ARS', CL: 'CLP', BR: 'BRL',
};

function dias(inicio: string, codigos: number[], maximas: number[], minimas: number[], chuva: number[]) {
  const base = new Date(inicio + 'T12:00:00');
  return codigos.map((codigo, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return { data: d.toISOString().slice(0, 10), codigo, maxima: maximas[i], minima: minimas[i], chuva: chuva[i] };
  });
}

export const CLIMA: Record<number, Weather> = {
  2650225: {
    atual: { temperatura: 11, sensacao: 8, umidade: 82, vento: 19, codigo: 3, maxima: 12, minima: 6 },
    diario: dias('2026-10-18', [3, 61, 80, 2, 3, 1, 61], [12, 11, 10, 13, 12, 14, 11], [6, 7, 5, 6, 7, 8, 6], [20, 75, 60, 10, 25, 5, 70]),
  },
  2267057: {
    atual: { temperatura: 21, sensacao: 21, umidade: 64, vento: 14, codigo: 1, maxima: 23, minima: 15 },
    diario: dias('2026-10-18', [1, 0, 2, 3, 61, 2, 0], [23, 24, 22, 20, 18, 21, 23], [15, 16, 15, 14, 13, 14, 15], [5, 0, 10, 30, 70, 15, 0]),
  },
  3435910: {
    atual: { temperatura: 19, sensacao: 18, umidade: 70, vento: 16, codigo: 2, maxima: 22, minima: 13 },
    diario: dias('2026-10-18', [2, 3, 95, 61, 1, 0, 0], [22, 21, 19, 18, 21, 24, 25], [13, 14, 14, 12, 11, 13, 15], [10, 30, 80, 65, 10, 0, 0]),
  },
  1850147: {
    atual: { temperatura: 18, sensacao: 17, umidade: 68, vento: 9, codigo: 3, maxima: 20, minima: 14 },
    diario: dias('2026-10-18', [3, 2, 1, 0, 0, 61, 3], [20, 21, 22, 23, 22, 18, 19], [14, 14, 15, 15, 16, 14, 13], [25, 10, 5, 0, 0, 80, 40]),
  },
  3871336: {
    atual: { temperatura: 23, sensacao: 22, umidade: 38, vento: 11, codigo: 0, maxima: 26, minima: 9 },
    diario: dias('2026-10-18', [0, 0, 1, 2, 0, 0, 1], [26, 27, 25, 23, 26, 28, 27], [9, 10, 10, 9, 11, 12, 11], [0, 0, 5, 10, 0, 0, 5]),
  },
  3462315: {
    atual: { temperatura: 16, sensacao: 15, umidade: 88, vento: 12, codigo: 45, maxima: 19, minima: 11 },
    diario: dias('2026-10-18', [45, 61, 63, 3, 2, 1, 0], [19, 17, 15, 18, 21, 23, 24], [11, 12, 11, 10, 12, 13, 14], [30, 80, 90, 40, 15, 5, 0]),
  },
};

/** Clima genérico para cidades sem dados no protótipo. */
export const CLIMA_PADRAO: Weather = CLIMA[2267057];

export const BUSCAS_RECENTES = ['Edimburgo', 'Lisboa', 'Tóquio', 'Buenos Aires', 'Paris'];

export const CIDADES_MAIS_PESQUISADAS = [
  { cidade: 'Edimburgo', pais: 'Reino Unido', buscas: 14 },
  { cidade: 'Lisboa', pais: 'Portugal', buscas: 11 },
  { cidade: 'Tóquio', pais: 'Japão', buscas: 8 },
  { cidade: 'Buenos Aires', pais: 'Argentina', buscas: 6 },
  { cidade: 'Paris', pais: 'França', buscas: 4 },
];

export const USUARIOS: User[] = [
  USUARIO_LOGADO,
  { id: 2, nome: 'Ana Carolina Souza', email: 'ana.souza@email.com', perfil: 'usuario', ativo: true, criadoEm: '2026-08-02', viagens: 4 },
  { id: 3, nome: 'Bruno Lima', email: 'bruno.lima@email.com', perfil: 'usuario', ativo: true, criadoEm: '2026-08-15', viagens: 2 },
  { id: 4, nome: 'Camila Rocha', email: 'camila.rocha@email.com', perfil: 'admin', ativo: true, criadoEm: '2026-08-20', viagens: 7 },
  { id: 5, nome: 'Diego Martins', email: 'diego.m@email.com', perfil: 'usuario', ativo: false, criadoEm: '2026-09-01', viagens: 0 },
  { id: 6, nome: 'Fernanda Alves', email: 'fe.alves@email.com', perfil: 'usuario', ativo: true, criadoEm: '2026-09-11', viagens: 3 },
  { id: 7, nome: 'Gabriel Nunes', email: 'gabriel.nunes@email.com', perfil: 'usuario', ativo: true, criadoEm: '2026-09-29', viagens: 1 },
  { id: 8, nome: 'Helena Castro', email: 'helena.castro@email.com', perfil: 'usuario', ativo: true, criadoEm: '2026-10-07', viagens: 5 },
];
