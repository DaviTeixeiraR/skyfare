import { TestBed } from '@angular/core/testing';
import { CityService } from './city.service';

describe('CityService', () => {
  let service: CityService;

  beforeEach(() => {
    service = TestBed.inject(CityService);
  });

  it('só busca com 2 letras ou mais', () => {
    expect(service.search('e')).toEqual([]);
    expect(service.search('ed').length).toBeGreaterThan(0);
  });

  it('ignora acentos e caixa e mantém cidades homônimas', () => {
    expect(service.search('TOQ').map((c) => c.nome)).toEqual(['Tóquio']);
    const edi = service.search('edi');
    expect(edi.map((c) => c.id)).toEqual([2650225, 4688275, 4257494]);
    expect(service.search('edi', 2)).toHaveLength(2);
  });

  it('encontra cidade por id e por nome e informa o continente', () => {
    expect(service.getById(2267057)?.nome).toBe('Lisboa');
    expect(service.getByName('toquio')?.codigoPais).toBe('JP');
    expect(service.getById(1)).toBeUndefined();
    expect(service.continentOf('AR')).toBe('América do Sul');
    expect(service.continentOf('US')).toBe('América do Norte');
  });
});
