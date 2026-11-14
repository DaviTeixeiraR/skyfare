import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../api';
import { City, Trip } from '../models';
import { CityService } from './city.service';
import { TripService } from './trip.service';

const lisboa: City = { id: 4, nome: 'Lisboa', estado: 'Lisboa', pais: 'Portugal', codigoPais: 'PT', latitude: 38.72, longitude: -9.14 };

const viagem = (id: number, userId: number, cidade: string, dataIda: string, orcamentoBRL: number) =>
  ({ id, userId, cidade, pais: 'Brasil', dataIda, dataVolta: dataIda, orcamentoBRL }) as Trip;

const TRIPS = [
  viagem(1, 1, 'Gramado', '2026-06-15', 3200),
  viagem(2, 1, 'Tóquio', '2099-07-10', 28000),
  viagem(3, 2, 'Roma', '2099-11-20', 8200),
];

describe('TripService', () => {
  let service: TripService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);

    TestBed.inject(CityService).load().subscribe();
    http.expectOne(`${API_URL}/cities`).flush([lisboa]);
    http.expectOne(`${API_URL}/countries`).flush([{ id: 'PT', moeda: 'EUR', continente: 'Europa' }]);

    service = TestBed.inject(TripService);
    service.load().subscribe();
    http.expectOne(`${API_URL}/trips`).flush(TRIPS);
  });

  afterEach(() => http.verify());

  it('lista só as viagens do usuário', () => {
    expect(service.listByUser(1)).toHaveLength(2);
    expect(service.getOwnedBy(3, 1)).toBeUndefined();
  });

  it('cadastra com POST e pega a moeda e o continente do país da cidade', () => {
    service.create(1, { city: lisboa, dataIda: '2099-05-10', dataVolta: '2099-05-17', orcamentoBRL: 9000, observacoes: ' Belém ' }).subscribe();
    const req = http.expectOne({ method: 'POST', url: `${API_URL}/trips` });
    expect(req.request.body).toMatchObject({ userId: 1, cidade: 'Lisboa', moeda: 'EUR', continente: 'Europa', observacoes: 'Belém' });
    req.flush({ ...req.request.body, id: 4 });
    expect(service.listByUser(1)).toHaveLength(3);
  });

  it('edita com PUT e exclui com DELETE', () => {
    service.update(TRIPS[0], { city: lisboa, dataIda: '2099-05-10', dataVolta: '2099-05-17', orcamentoBRL: 100, observacoes: '' }).subscribe();
    const put = http.expectOne({ method: 'PUT', url: `${API_URL}/trips/1` });
    put.flush({ ...put.request.body });
    expect(service.getOwnedBy(1, 1)?.cidade).toBe('Lisboa');

    service.remove(1).subscribe();
    http.expectOne({ method: 'DELETE', url: `${API_URL}/trips/1` }).flush({});
    expect(service.getOwnedBy(1, 1)).toBeUndefined();
  });

  it('pesquisa sem diferenciar acentos, filtra pela situação e ordena', () => {
    expect(service.search(1, { texto: 'toquio', status: 'todas', ordem: 'data' }).map((t) => t.cidade)).toEqual(['Tóquio']);
    expect(service.search(1, { texto: '', status: 'realizada', ordem: 'data' }).map((t) => t.cidade)).toEqual(['Gramado']);
    expect(service.search(1, { texto: '', status: 'todas', ordem: 'orcamento' })[0].cidade).toBe('Tóquio');
  });
});
