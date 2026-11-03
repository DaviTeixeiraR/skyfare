import { TestBed } from '@angular/core/testing';
import { BusinessError } from '../errors';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = TestBed.inject(UserService);
  });

  it('carrega os usuários fictícios e calcula os indicadores', () => {
    expect(service.total()).toBe(8);
    expect(service.activeCount()).toBe(7);
    expect(service.adminCount()).toBe(2);
  });

  it('cadastra usuário com perfil padrão e id seguinte', () => {
    const user = service.create({ nome: 'Maria Souza', email: 'maria@email.com', senha: 'senha1234' });
    expect(user).toMatchObject({ id: 9, perfil: 'usuario', ativo: true });
    expect(service.total()).toBe(9);
  });

  it('não permite e-mail repetido (sem diferenciar caixa) nem dados inválidos', () => {
    expect(() => service.create({ nome: 'Outro', email: 'SKYFAREUSER@gmail.com', senha: 'senha1234' })).toThrow(
      'Já existe uma conta',
    );
    expect(() => service.create({ nome: 'Al', email: 'al@email.com', senha: 'senha1234' })).toThrow(BusinessError);
    expect(() => service.create({ nome: 'Alan', email: 'alan@email.com', senha: '123' })).toThrow('8 caracteres');
  });

  it('pesquisa por nome ou e-mail e filtra por perfil', () => {
    expect(service.search('camila').map((u) => u.id)).toEqual([4]);
    expect(service.search('EMAIL.COM', 'admin').map((u) => u.id)).toEqual([4]);
    expect(service.search('', 'admin')).toHaveLength(2);
  });

  it('altera perfil e ativa ou desativa a conta', () => {
    expect(service.setProfile(2, 'admin').perfil).toBe('admin');
    expect(service.toggleActive(2).ativo).toBe(false);
    expect(service.toggleActive(2).ativo).toBe(true);
    expect(() => service.toggleActive(99)).toThrow('não encontrado');
  });

  it('exclui usuário', () => {
    service.remove(5);
    expect(service.getById(5)).toBeUndefined();
    expect(() => service.remove(5)).toThrow(BusinessError);
  });
});
