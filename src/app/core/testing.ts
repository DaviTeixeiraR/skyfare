import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from './api';
import { City, User } from './models';
import { AuthService } from './services/auth.service';

/** Dados de apoio dos testes (cópia reduzida do db.json). */
export const SENHA = 'skyfare123';

export const USERS: User[] = [
  { id: 1, nome: 'Davi Teixeira', email: 'skyfareuser@gmail.com', perfil: 'admin', ativo: true, criadoEm: '2026-10-18', senha: SENHA },
  { id: 2, nome: 'Ana Carolina Souza', email: 'ana.souza@email.com', perfil: 'usuario', ativo: true, criadoEm: '2026-08-02', senha: SENHA },
  { id: 5, nome: 'Diego Martins', email: 'diego.m@email.com', perfil: 'usuario', ativo: false, criadoEm: '2026-09-01', senha: SENHA },
];

export const LISBOA: City = { id: 2267057, nome: 'Lisboa', estado: 'Lisboa', pais: 'Portugal', codigoPais: 'PT', latitude: 38.72, longitude: -9.14 };
export const SYDNEY: City = { id: 2147714, nome: 'Sydney', estado: 'Nova Gales do Sul', pais: 'Austrália', codigoPais: 'AU', latitude: -33.87, longitude: 151.21 };

export const CITIES: City[] = [
  { id: 2650225, nome: 'Edimburgo', estado: 'Escócia', pais: 'Reino Unido', codigoPais: 'GB', latitude: 55.95, longitude: -3.19 },
  { id: 4688275, nome: 'Edinburg', estado: 'Texas', pais: 'Estados Unidos', codigoPais: 'US', latitude: 26.3, longitude: -98.16 },
  { id: 4257494, nome: 'Edinburgh', estado: 'Indiana', pais: 'Estados Unidos', codigoPais: 'US', latitude: 39.35, longitude: -85.97 },
  LISBOA,
  { id: 1850147, nome: 'Tóquio', estado: 'Tóquio', pais: 'Japão', codigoPais: 'JP', latitude: 35.69, longitude: 139.69 },
  SYDNEY,
];

export const COUNTRIES = [
  { id: 'GB', moeda: 'GBP', continente: 'Europa' },
  { id: 'US', moeda: 'USD', continente: 'América do Norte' },
  { id: 'PT', moeda: 'EUR', continente: 'Europa' },
  { id: 'JP', moeda: 'JPY', continente: 'Ásia' },
  { id: 'AU', moeda: 'AUD', continente: 'Oceania' },
];

/** Configura o TestBed com o HttpClient de teste e devolve o controlador das requisições. */
export function setupHttp(providers: unknown[] = []): HttpTestingController {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), ...(providers as never[])],
  });
  return TestBed.inject(HttpTestingController);
}

/** Responde a carga inicial de uma coleção (GET /<colecao>). */
export function flushList(http: HttpTestingController, collection: string, body: unknown[]): void {
  http.expectOne(`${API_URL}/${collection}`).flush(body);
}

/** Faz o login e responde a consulta do e-mail com o usuário encontrado (ou nenhum). */
export function login(auth: AuthService, http: HttpTestingController, email: string, senha = SENHA, lembrar = true) {
  let erro = '';
  auth.login(email, senha, lembrar).subscribe({ error: (e) => (erro = e.message) });
  http
    .expectOne((r) => r.url === `${API_URL}/users` && r.params.get('email') === email)
    .flush(USERS.filter((u) => u.email === email));
  return erro;
}
