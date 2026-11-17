# Skyfare

Planejador de viagens com previsão do tempo e câmbio. Você pesquisa uma cidade e vê, na mesma tela, o clima no destino e quanto vale a moeda local em reais. Também dá para cadastrar viagens com datas e orçamento e acompanhar tudo em um dashboard.

> Projeto da disciplina **Desenvolvimento Web Front-End**, do curso de Ciência da Computação da Universidade FUMEC (prof. Dângelo Silva Miranda).

**Sky** (céu, clima) + **fare** (tarifa, custo da viagem).

## Funcionalidades

- Busca de cidades com autocomplete (159 cidades de 30 países)
- Clima atual e previsão de 7 dias
- Cotação da moeda local em reais, com histórico de 30 dias e conversor de valores
- Cadastro, listagem, detalhe, edição e exclusão de viagens
- Dashboard com indicadores e gráficos
- Login, cadastro de usuário e controle de acesso por perfil (usuário e administrador)

## Telas

| Nº | Tela | Acesso |
|---|---|---|
| 1 | Login | Pública |
| 2 | Cadastro de usuário | Pública |
| 3 | Busca rápida (início) | Pública |
| 4 | Minhas viagens | Usuário |
| 5 | Detalhe da viagem | Usuário |
| 6 | Formulário de viagem | Usuário |
| 7 | Dashboard | Usuário |
| 8 | Gerenciamento de usuários | Administrador |
| 9 | Acesso negado | Pública |
| 10 | Página não encontrada (404) | Pública |

## Web API (JSON-Server)

Os dados ficam no arquivo `db.json`, servido pelo [JSON-Server](https://github.com/typicode/json-server) em http://localhost:3000. Os *services* do Angular acessam a API com o `HttpClient`:

| Coleção | Service | Requisições |
|---|---|---|
| `users` | UserService | GET, POST, PATCH, DELETE |
| `trips` | TripService | GET, POST, PUT, DELETE |
| `cities` e `countries` | CityService | GET |
| `rates` | ExchangeService | GET |
| `weather` | WeatherService | GET |

O `db.json` tem 30 países, as principais cidades de cada um (159 no total), a moeda e o continente de cada país, 21 cotações e o clima de todas as cidades. O clima e as cotações são **dados de exemplo** (inventados para a demonstração), no formato das APIs [Open-Meteo](https://open-meteo.com) e [AwesomeAPI](https://docs.awesomeapi.com.br/api-de-moedas).

## Tecnologias

Angular, TypeScript, HttpClient, RxJS, signals, formulários reativos com Validators, guards de rota, lazy loading, Chart.js e JSON-Server.

## Como rodar

Requisitos: Node.js 22 ou superior.

Em um terminal, suba a API:

```bash
npm install
npm run api
```

Em outro terminal, suba o Angular:

```bash
npm start
```

Depois abra http://localhost:4200. Sem a API rodando, a aplicação abre, mas avisa que não conseguiu carregar os dados.

> **Situação atual (Trabalho final):** todos os dados são lidos e gravados na Web API do JSON-Server por meio do `HttpClient`, e todos os formulários são reativos, com `Validators` e mensagens de erro. O cadastro só é enviado ao servidor quando os campos obrigatórios estão preenchidos corretamente. Para voltar aos dados iniciais, rode `git checkout db.json`. O guia de estilo está em http://localhost:4200/guia-de-estilo.

### Login padrão

O login é simples: o e-mail e a senha são conferidos com duas contas fixas no código (`src/app/core/services/auth.service.ts`), sem consultar a API.

| E-mail | Senha | Perfil |
|---|---|---|
| skyfareuser@gmail.com | skyfare123 | Administrador |
| ana.souza@email.com | skyfare123 | Usuário |

O administrador abre todas as telas, inclusive Usuários. Com a conta de usuário, a tela de acesso negado aparece ao abrir `/admin/usuarios`. O cadastro grava a conta na API (aparece na tela de usuários) e já entra com ela, mas depois de sair só as duas contas acima conseguem entrar de novo.

### Testes

```bash
npm test
```

## Estrutura

```
src/app/
  core/        modelos, endereço da API, services (viagens, usuários, login, cidades, câmbio, clima, avisos) e guards
  app-routing.module.ts / app.routes.ts   rotas da aplicação
  layout/      layout principal (navegação) e de autenticação
  shared/      componentes reutilizáveis (cartões de clima e câmbio, busca, gráficos, ícones)
  features/    telas: auth, home, trips, dashboard, admin, errors, style-guide
```

## Fluxo de trabalho

- **GitFlow**: `main` guarda as versões entregues, `develop` integra o desenvolvimento e cada funcionalidade nasce em uma branch `feature/*`.
- **Commits atômicos** com mensagens no padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/) (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `style:`, `test:`).

## Documentos

- [Trabalho 00: relatório parcial e Kanban](docs/trabalho-00/)
- [Trabalho 01: protótipo, relatório e Kanban](docs/trabalho-01/)
- [Trabalho 02: relatório e Kanban](docs/trabalho-02/)
- [Trabalho final: relatório e Kanban](docs/trabalho-final/)

## Autor

Davi Teixeira
