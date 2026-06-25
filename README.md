# Plataforma Web de Venda de Cursos

## Descrição
Aplicação web voltada para a venda de cursos online, contando com sistema de autenticação de usuários e fluxo completo de compra. A plataforma permite que os usuários naveguem pelo catálogo, adquiram acesso através de uma integração com API de pagamento e interajam com a comunidade por meio de comentários nas aulas dos cursos.

## GitHub Project
* https://github.com/users/Chicoz0/projects/3

## Visão Geral da Arquitetura

```
Frontend (React/Vite) → Backend API (Go/Chi) → PostgreSQL
         ↑                        ↑
     porta 3000              porta 8080

Tudo orquestrado via Docker Compose
```

## Roles de Usuário

| Role | Permissões |
| :--- | :--- |
| `admin` | Gerencia usuários, cursos e comentários |
| `creator` | Cria e publica cursos, responde comentários |
| `student` | Compra cursos, assiste aulas, comenta e avalia |

## Tecnologias Utilizadas

| Camada | Tecnologia |
| :--- | :--- |
| **Frontend** | React + TypeScript + Vite |
| **Backend** | Go (Golang) com Chi Router |
| **Banco de Dados** | PostgreSQL |
| **Vídeos** | Links privados (ex: YouTube não listado) |
| **Pagamentos** | API externa ou Mock |
| **Containerização** | Docker e Docker Compose |

## Funcionalidades

### Usuários
* Cadastro de novas contas e autenticação (Login).
* Edição de informações do perfil.

### Catálogo de Cursos
* Listagem de cursos disponíveis.
* Página de detalhes com informações específicas de cada curso.

### Fluxo de Compra
* Carrinho/Fluxo de checkout.
* Integração com gateway de pagamento.
* Liberação automática de acesso ao conteúdo após a confirmação do pagamento.

### Interação
* Sistema de comentários por aula (exclusivo para alunos matriculados, creators e admins).
* Sistema de avaliações com nota de 1 a 5.

### Área do Aluno
* Painel para visualização e acesso aos cursos adquiridos pelo usuário.

## Pré-requisitos

- **Docker** e **Docker Compose** (para rodar com containers)
- Desenvolvimento local: **Go 1.25+** e **Node.js 18+**

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
API_PORT=8080
POSTGRES_USER=user
POSTGRES_PASSWORD=user
POSTGRES_DB=courses
POSTGRES_PORT=5432
DATABASE_URL=postgres://user:user@postgres_db:5432/courses?sslmode=disable
JWT_SECRET=sua-chave-secreta
ALLOWED_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

## Comandos Principais

```bash
# Subir banco de dados
make db         # ou: docker compose up postgres_db

# Subir API
make api        # ou: cd backend && go run cmd/main.go

# Popular banco com dados de exemplo
make seed       # ou: cd backend && go run cmd/seed/main.go

# Ver documentação da API (Swagger)
make docs       # ou: docker compose up swagger  (porta 8081)

# Subir tudo junto
docker compose up
```

## Estrutura do Repositório

```
web-amigos/
├── backend/          # API em Go
├── frontend/         # SPA em React/TypeScript
├── database/         # Schema e configuração do PostgreSQL
├── compose.yml       # Docker Compose principal
├── Makefile          # Atalhos de desenvolvimento
└── openapi.yml       # Especificação OpenAPI/Swagger
```

## Estrutura do Banco de Dados

![schema_do_banco](database/schema.png)

## Membros do Grupo

* Eduardo Vinicius Faleiro
* Francisco de Paula Lemos
* Lucas dos Santos Santin
* Lucas Gusmão Valduga
* Marlon Correia
