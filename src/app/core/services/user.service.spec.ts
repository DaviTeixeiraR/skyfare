import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../api';
import { User } from '../models';
import { UserService } from './user.service';

const USERS: User[] = [
  { id: 1, nome: 'Davi Teixeira', email: 'skyfareuser@gmail.com', perfil: 'admin', ativo: true, criadoEm: '2026-10-18' },
  { id: 2, nome: 'Ana Souza', email: 'ana.souza@email.com', perfil: 'usuario', ativo: true, criadoEm: '2026-08-02' },
  { id: 5, nome: 'Diego Martins', email: 'diego.m@email.com', perfil: 'usuario', ativo: false, criadoEm: '2026-09-01' },
];

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(UserService);
    service.load().subscribe();
    http.expectOne(`${API_URL}/users`).flush(USERS);
  });

  afterEach(() => http.verify());

  it('carrega os usuários da API e conta ativos e administradores', () => {
    expect(service.users()).toHaveLength(3);
    expect(service.activeCount()).toBe(2);
    expect(service.adminCount()).toBe(1);
  });

  it('pesquisa por nome ou e-mail e filtra por perfil', () => {
    expect(service.search('ANA', 'todos').map((u) => u.id)).toEqual([2]);
    expect(service.search('', 'admin').map((u) => u.id)).toEqual([1]);
    expect(service.emailExists('ANA.SOUZA@email.com')).toBe(true);
  });

  it('cadastra com POST, altera com PATCH e exclui com DELETE', () => {
    service.create('Maria Souza', 'Maria@Email.com').subscribe();
    const post = http.expectOne({ method: 'POST', url: `${API_URL}/users` });
    expect(post.request.body).toMatchObject({ nome: 'Maria Souza', email: 'maria@email.com', perfil: 'usuario', ativo: true });
    post.flush({ ...post.request.body, id: 9 });
    expect(service.users()).toHaveLength(4);

    service.update(2, { ativo: false }).subscribe();
    http.expectOne({ method: 'PATCH', url: `${API_URL}/users/2` }).flush({ ...USERS[1], ativo: false });
    expect(service.activeCount()).toBe(2);

    service.remove(5).subscribe();
    http.expectOne({ method: 'DELETE', url: `${API_URL}/users/5` }).flush({});
    expect(service.users().some((u) => u.id === 5)).toBe(false);
  });
});
