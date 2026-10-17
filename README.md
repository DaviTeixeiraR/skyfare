# Skyfare

Planejador de viagens com previsão do tempo e câmbio. Você pesquisa uma cidade e vê, na mesma tela, o clima no destino e quanto vale a moeda local em reais. Também dá para cadastrar viagens com datas e orçamento e acompanhar tudo em um dashboard.

> Projeto da disciplina **Desenvolvimento Web Front-End**, do curso de Ciência da Computação da Universidade FUMEC (prof. Dângelo Silva Miranda).

**Sky** (céu, clima) + **fare** (tarifa, custo da viagem).

## Funcionalidades

- Busca de cidades com autocomplete
- Clima atual e previsão de 7 dias
- Cotação da moeda local em reais, com histórico de 30 dias e conversor de valores
- Cadastro, listagem, detalhe, edição e exclusão de viagens
- Dashboard com indicadores e gráficos
- Login, cadastro de usuário e controle de acesso por perfil (usuário e administrador)
- Favoritos e histórico de buscas

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

## APIs

| API | Uso |
|---|---|
| [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api) | Sugestões de cidades, coordenadas e país |
| [Open-Meteo Forecast](https://open-meteo.com/en/docs) | Clima atual e previsão |
| [REST Countries](https://restcountries.com) | Moeda, bandeira e continente do país |
| [AwesomeAPI de Moedas](https://docs.awesomeapi.com.br/api-de-moedas) | Cotação em reais |
| [JSON-Server](https://github.com/typicode/json-server) | API local para usuários, viagens e favoritos |

As APIs externas são gratuitas e não precisam de chave.

## Tecnologias

Angular, TypeScript, RxJS, signals, formulários reativos, guards de rota, lazy loading, Chart.js e JSON-Server.

## Como rodar

Requisitos: Node.js 22 ou superior.

```bash
npm install
npm start
```

Depois abra http://localhost:4200.

> **Situação atual (Trabalho 01, protótipo):** as 10 telas já estão prontas em Angular, com dados fictícios (`src/app/core/mock`). A ligação com as APIs, o JSON-Server e os guards de rota fica para a próxima etapa. O guia de estilo está em http://localhost:4200/guia-de-estilo.

## Estrutura

```
src/app/
  core/        modelos, utilitários e dados fictícios
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

## Autor

Davi Teixeira
