import { HttpErrorResponse } from '@angular/common/http';
import { catchError, MonoTypeOperatorFunction, throwError } from 'rxjs';

/**
 * Erro de regra de negócio lançado pelos services (e-mail repetido, datas inválidas...).
 * A mensagem já está em português e pode ser exibida direto para o usuário.
 */
export class BusinessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessError';
  }
}

/**
 * Operador usado nas requisições HTTP: erros de rede ou do servidor viram BusinessError
 * com uma mensagem amigável; erros de regra de negócio passam sem mudança.
 */
export function friendlyError<T>(fallback: string): MonoTypeOperatorFunction<T> {
  return catchError((e: unknown) => {
    if (e instanceof BusinessError) return throwError(() => e);
    if (e instanceof HttpErrorResponse && e.status === 0) {
      return throwError(() => new BusinessError('Sem conexão com a API. Verifique se o JSON-Server está rodando (npm run api).'));
    }
    if (e instanceof HttpErrorResponse && e.status === 404) {
      return throwError(() => new BusinessError('Registro não encontrado no servidor.'));
    }
    return throwError(() => new BusinessError(fallback));
  });
}

/** Mensagem para exibir ao usuário a partir de um erro qualquer. */
export function errorMessage(e: unknown, fallback = 'Não foi possível concluir a ação.'): string {
  return e instanceof BusinessError ? e.message : fallback;
}
