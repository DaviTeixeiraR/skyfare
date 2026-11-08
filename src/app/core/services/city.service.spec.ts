import { TestBed } from '@angular/core/testing';
import { CITIES, COUNTRIES, flushList, setupHttp } from '../testing';
import { CityService } from './city.service';

describe('CityService', () => {
  let service: CityService;

  beforeEach(() => {
    const http = setupHttp();
    service = TestBed.inject(CityService);
    service.load().subscribe();
    flushList(http, 'cities', CITIES);
    flushList(http, 'countries', COUNTRIES);
    http.verify();
  });

  it('só busca com 2 letras ou mais', () => {
    expect(service.search('e')).toEqual([]);
    expect(service.search('ed').length).toBeGreaterThan(0);
  });

  it('ignora acentos e caixa e mantém cidades homônimas', () => {
    expect(service.search('TOQ').map((c) => c.nome)).toEqual(['Tóquio']);
    expect(service.search('edi').map((c) => c.id)).toEqual([2650225, 4688275, 4257494]);
    expect(service.search('edi', 2)).toHaveLength(2);
  });

  it('encontra cidade por id e por nome e informa moeda e continente do país', () => {
    expect(service.getById(2267057)?.nome).toBe('Lisboa');
    expect(service.getByName('toquio')?.codigoPais).toBe('JP');
    expect(service.getById(1)).toBeUndefined();
    expect(service.continentOf('US')).toBe('América do Norte');
    expect(service.currencyOf('PT')).toBe('EUR');
  });
});
