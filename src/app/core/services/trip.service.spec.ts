import { TestBed } from '@angular/core/testing';
import { BusinessError } from '../errors';
import { CIDADES } from '../mock/mock-data';
import { TripInput } from '../models';
import { TripService } from './trip.service';

const lisboa = CIDADES.find((c) => c.nome === 'Lisboa')!;
const sydney = CIDADES.find((c) => c.nome === 'Sydney')!;

function input(overrides: Partial<TripInput> = {}): TripInput {
  return {
    city: lisboa,
    dataIda: '2027-05-10',
    dataVolta: '2027-05-17',
    orcamentoBRL: 9000,
    observacoes: ' Visitar Belém ',
    ...overrides,
  };
}

describe('TripService', () => {
  let service: TripService;

  beforeEach(() => {
    service = TestBed.inject(TripService);
  });

  it('lista apenas as viagens do usuário', () => {
    expect(service.listByUser(1)).toHaveLength(6);
    expect(service.listByUser(2)).toHaveLength(2);
    expect(service.listByUser(99)).toHaveLength(0);
  });

  it('só entrega a viagem para o dono', () => {
    expect(service.getOwnedBy(1, 1)?.cidade).toBe('Edimburgo');
    expect(service.getOwnedBy(1, 2)).toBeUndefined();
  });

  it('cadastra a viagem e deriva moeda e continente da cidade escolhida', () => {
    const trip = service.create(1, input());

    expect(trip.id).toBe(15);
    expect(trip).toMatchObject({ cidade: 'Lisboa', moeda: 'EUR', continente: 'Europa', userId: 1 });
    expect(trip.observacoes).toBe('Visitar Belém');
    expect(service.listByUser(1)).toHaveLength(7);
    expect(service.countByUser(1)).toBe(7);
  });

  it('usa a moeda local mesmo sem cotação disponível', () => {
    const trip = service.create(1, input({ city: sydney }));
    expect(trip).toMatchObject({ moeda: 'AUD', continente: 'Oceania' });
  });

  it('recusa volta antes da ida, orçamento zerado e destino vazio', () => {
    expect(() => service.create(1, input({ dataVolta: '2027-05-01' }))).toThrow(BusinessError);
    expect(() => service.create(1, input({ orcamentoBRL: 0 }))).toThrow('maior que zero');
    expect(() => service.create(1, input({ city: undefined as never }))).toThrow('cidade');
    expect(service.total()).toBe(14);
  });

  it('edita uma viagem existente', () => {
    const updated = service.update(1, input({ orcamentoBRL: 20000 }));
    expect(updated.orcamentoBRL).toBe(20000);
    expect(service.getById(1)?.cidade).toBe('Lisboa');
    expect(() => service.update(999, input())).toThrow('não encontrada');
  });

  it('exclui a viagem', () => {
    service.remove(2);
    expect(service.getById(2)).toBeUndefined();
    expect(service.countByUser(1)).toBe(5);
    expect(() => service.remove(2)).toThrow(BusinessError);
  });

  describe('search', () => {
    it('ignora acentos e caixa ao buscar por cidade ou país', () => {
      const resultado = service.search(1, { texto: 'toquio', status: 'todas', ordem: 'data' });
      expect(resultado.map((t) => t.cidade)).toEqual(['Tóquio']);
      expect(service.search(1, { texto: 'ARGENTINA', status: 'todas', ordem: 'data' })).toHaveLength(1);
    });

    it('filtra por situação', () => {
      const futuras = service.search(1, { texto: '', status: 'futura', ordem: 'data' });
      const realizadas = service.search(1, { texto: '', status: 'realizada', ordem: 'data' });
      expect(futuras).toHaveLength(4);
      expect(realizadas.map((t) => t.cidade)).toEqual(['Gramado', 'Santiago']);
    });

    it('ordena por data de ida ou por maior orçamento', () => {
      const porData = service.search(1, { texto: '', status: 'todas', ordem: 'data' });
      expect(porData[0].cidade).toBe('Gramado');
      const porOrcamento = service.search(1, { texto: '', status: 'todas', ordem: 'orcamento' });
      expect(porOrcamento[0].cidade).toBe('Tóquio');
    });
  });
});
