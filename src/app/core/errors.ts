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
