import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../api';
import { BusinessError } from '../errors';
import { flushList, setupHttp, USERS } from '../testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    http = setupHttp();
    service = TestBed.inject(UserService);
    service.load().subscribe();
    flushList(http, 'users', USERS);
  });

  afterEach(() => http.verify());

  it('carrega os usuários da API e calcula os indicadores', () => {
    expect(service.total()).toBe(3);
    expect(service.activeCount()).toBe(2);
    expect(service.adminCount()).toBe(1);
  });

  it('cadastra usuário com POST depois de conferir o e-mail', () => {
    let nome = '';
    service.create({ nome: 'Maria Souza', email: 'Maria@Email.com', senha: 'senha1234' }).subscribe((u) => (nome = u.nome));

    const check = http.expectOne((r) => r.url === `${API_URL}/users` && r.params.get('email') === 'maria@email.com');
    check.flush([]);
    const post = http.expectOne({ method: 'POST', url: `${API_URL}/users` });
    expect(post.request.body).toMatchObject({ email: 'maria@email.com', perfil: 'usuario', ativo: true });
    post.flush({ ...post.request.body, id: 9 });

    expect(nome).toBe('Maria Souza');
    expect(service.total()).toBe(4);
  });

  it('não envia o cadastro com e-mail repetido nem com dados inválidos', () => {
    let erro = '';
    service.create({ nome: 'Outro', email: 'skyfareuser@gmail.com', senha: 'senha1234' }).subscribe({ error: (e) => (erro = e.message) });
    http.expectOne((r) => r.params.get('email') === 'skyfareuser@gmail.com').flush([USERS[0]]);
    expect(erro).toContain('Já existe uma conta');

    service.create({ nome: 'Al', email: 'al@email.com', senha: 'senha1234' }).subscribe({ error: (e) => expect(e).toBeInstanceOf(BusinessError) });
    service.create({ nome: 'Alan', email: 'alan@email.com', senha: '123' }).subscribe({ error: (e) => expect(e.message).toContain('8 caracteres') });
    // Nenhuma requisição foi feita para os dados inválidos (verificado no afterEach).
  });

  it('pesquisa por nome ou e-mail e filtra por perfil', () => {
    expect(service.search('ana').map((u) => u.id)).toEqual([2]);
    expect(service.search('', 'admin').map((u) => u.id)).toEqual([1]);
  });

  it('altera perfil e situação com PATCH', () => {
    service.toggleActive(2).subscribe();
    const req = http.expectOne({ method: 'PATCH', url: `${API_URL}/users/2` });
    expect(req.request.body).toEqual({ ativo: false });
    req.flush({ ...USERS[1], ativo: false });
    expect(service.getById(2)?.ativo).toBe(false);
  });

  it('exclui usuário com DELETE', () => {
    service.remove(5).subscribe();
    http.expectOne({ method: 'DELETE', url: `${API_URL}/users/5` }).flush({});
    expect(service.getById(5)).toBeUndefined();
  });

  it('transforma falha de conexão em mensagem amigável', () => {
    let erro = '';
    service.remove(2).subscribe({ error: (e) => (erro = e.message) });
    http.expectOne(`${API_URL}/users/2`).error(new ProgressEvent('error'), { status: 0 });
    expect(erro).toContain('JSON-Server');
  });
});
