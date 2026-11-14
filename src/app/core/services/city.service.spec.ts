import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../api';
import { CityService } from './city.service';

const cidade = (id: number, nome: string, codigoPais: string) => ({ id, nome, estado: '', pais: '', codigoPais, latitude: 0, longitude: 0 });

describe('CityService', () => {
  let service: CityService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(CityService);
    service.load().subscribe();
    http.expectOne(`${API_URL}/cities`).flush([cidade(1, 'Edimburgo', 'GB'), cidade(2, 'Edinburg', 'US'), cidade(3, 'Tóquio', 'JP')]);
    http.expectOne(`${API_URL}/countries`).flush([{ id: 'JP', moeda: 'JPY', continente: 'Ásia' }]);
  });

  it('só busca com 2 letras ou mais, sem diferenciar acentos e caixa', () => {
    expect(service.search('e')).toEqual([]);
    expect(service.search('TOQ').map((c) => c.nome)).toEqual(['Tóquio']);
    expect(service.search('edi').map((c) => c.id)).toEqual([1, 2]);
  });

  it('informa a moeda e o continente do país', () => {
    expect(service.currencyOf('JP')).toBe('JPY');
    expect(service.continentOf('JP')).toBe('Ásia');
  });
});
