import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../api';
import { Trip, TripInput } from '../models';
import { CITIES, COUNTRIES, flushList, LISBOA, setupHttp, SYDNEY } from '../testing';
import { CityService } from './city.service';
import { TripService } from './trip.service';

const TRIPS: Trip[] = [
  { id: 1, userId: 1, cityId: 2650225, cidade: 'Edimburgo', estado: 'Escócia', pais: 'Reino Unido', codigoPais: 'GB', continente: 'Europa', moeda: 'GBP', dataIda: '2026-12-12', dataVolta: '2026-12-20', orcamentoBRL: 15000, observacoes: '' },
  { id: 4, userId: 1, cityId: 1850147, cidade: 'Tóquio', estado: 'Tóquio', pais: 'Japão', codigoPais: 'JP', continente: 'Ásia', moeda: 'JPY', dataIda: '2027-07-10', dataVolta: '2027-07-24', orcamentoBRL: 28000, observacoes: '' },
  { id: 6, userId: 1, cityId: 3462315, cidade: 'Gramado', estado: 'Rio Grande do Sul', pais: 'Brasil', codigoPais: 'BR', continente: 'América do Sul', moeda: 'BRL', dataIda: '2026-06-15', dataVolta: '2026-06-19', orcamentoBRL: 3200, observacoes: '' },
  { id: 7, userId: 2, cityId: 3169070, cidade: 'Roma', estado: 'Lácio', pais: 'Itália', codigoPais: 'IT', continente: 'Europa', moeda: 'EUR', dataIda: '2026-11-20', dataVolta: '2026-11-27', orcamentoBRL: 8200, observacoes: '' },
];

function input(overrides: Partial<TripInput> = {}): TripInput {
  return { city: LISBOA, dataIda: '2027-05-10', dataVolta: '2027-05-17', orcamentoBRL: 9000, observacoes: ' Visitar Belém ', ...overrides };
}

describe('TripService', () => {
  let service: TripService;
  let http: HttpTestingController;

  beforeEach(() => {
    http = setupHttp();
    TestBed.inject(CityService).load().subscribe();
    flushList(http, 'cities', CITIES);
    flushList(http, 'countries', COUNTRIES);
    service = TestBed.inject(TripService);
    service.load().subscribe();
    flushList(http, 'trips', TRIPS);
  });

  afterEach(() => http.verify());

  it('lista apenas as viagens do usuário e só entrega a viagem para o dono', () => {
    expect(service.listByUser(1)).toHaveLength(3);
    expect(service.listByUser(99)).toHaveLength(0);
    expect(service.getOwnedBy(1, 1)?.cidade).toBe('Edimburgo');
    expect(service.getOwnedBy(7, 1)).toBeUndefined();
  });

  it('cadastra a viagem com POST e deriva moeda e continente da cidade', () => {
    service.create(1, input()).subscribe();
    const req = http.expectOne({ method: 'POST', url: `${API_URL}/trips` });
    expect(req.request.body).toMatchObject({ userId: 1, cidade: 'Lisboa', moeda: 'EUR', continente: 'Europa', observacoes: 'Visitar Belém' });
    req.flush({ ...req.request.body, id: 15 });
    expect(service.countByUser(1)).toBe(4);
  });

  it('usa a moeda local mesmo sem cotação disponível', () => {
    service.create(1, input({ city: SYDNEY })).subscribe();
    const req = http.expectOne({ method: 'POST', url: `${API_URL}/trips` });
    expect(req.request.body).toMatchObject({ moeda: 'AUD', continente: 'Oceania' });
    req.flush({ ...req.request.body, id: 16 });
  });

  it('não envia viagem com volta antes da ida, orçamento zerado ou sem destino', () => {
    const erros: string[] = [];
    const guarda = { error: (e: Error) => erros.push(e.message) };
    service.create(1, input({ dataVolta: '2027-05-01' })).subscribe(guarda);
    service.create(1, input({ orcamentoBRL: 0 })).subscribe(guarda);
    service.create(1, input({ city: undefined as never })).subscribe(guarda);
    expect(erros).toEqual([
      'A data de volta não pode ser antes da ida.',
      'O orçamento precisa ser maior que zero.',
      'Escolha uma cidade de destino.',
    ]);
  });

  it('edita a viagem com PUT', () => {
    service.update(1, input({ orcamentoBRL: 20000 })).subscribe();
    const req = http.expectOne({ method: 'PUT', url: `${API_URL}/trips/1` });
    expect(req.request.body).toMatchObject({ id: 1, userId: 1, cidade: 'Lisboa', orcamentoBRL: 20000 });
    req.flush(req.request.body);
    expect(service.getById(1)?.cidade).toBe('Lisboa');
  });

  it('exclui a viagem com DELETE', () => {
    service.remove(4).subscribe();
    http.expectOne({ method: 'DELETE', url: `${API_URL}/trips/4` }).flush({});
    expect(service.getById(4)).toBeUndefined();
    service.remove(4).subscribe({ error: (e) => expect(e.message).toContain('não encontrada') });
  });

  it('pesquisa sem acentos, filtra pela situação e ordena', () => {
    expect(service.search(1, { texto: 'toquio', status: 'todas', ordem: 'data' }).map((t) => t.cidade)).toEqual(['Tóquio']);
    expect(service.search(1, { texto: '', status: 'realizada', ordem: 'data' }).map((t) => t.cidade)).toEqual(['Gramado']);
    expect(service.search(1, { texto: '', status: 'todas', ordem: 'orcamento' })[0].cidade).toBe('Tóquio');
  });
});
