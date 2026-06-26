# Backend — API em Go

API REST da plataforma de cursos, desenvolvida em Go com arquitetura em camadas.

## Stack

| Tecnologia | Versão | Uso |
| :--- | :--- | :--- |
| Go | 1.25 | Linguagem principal (módulo `courses`) |
| Chi | v5 | Router HTTP |
| GORM | — | ORM com driver PostgreSQL |
| golang-jwt/jwt | v5 | Autenticação JWT |
| Validator | v10 | Validação de dados de entrada |

## Arquitetura em Camadas

```
Handler (HTTP) → Service (regras de negócio) → Repository (DB) → PostgreSQL
     ↑                                                 ↑
  Chi Router                                      GORM + uuid
```

- **Handler**: recebe requisições HTTP, valida entrada, chama o Service e retorna a resposta
- **Service**: implementa as regras de negócio, orquestra chamadas ao Repository
- **Repository**: responsável exclusivamente pelo acesso ao banco de dados via GORM

## Regras de Negócio Principais

- Apenas `creator` ou `admin` podem criar, editar e publicar cursos
- Apenas estudantes com enrollment `active` podem: assistir aulas, avaliar cursos e comentar aulas
- Creators e admins têm acesso a todo o conteúdo sem necessidade de enrollment
- Reviews: um estudante pode avaliar apenas uma vez por curso e precisa ter enrollment ativo
- Comentários por aula: permitidos para estudante matriculado ativo, creator ou admin
- Deletar comentário: permitido para o autor, qualquer creator ou admin
- Enrollment gerado via webhook do gateway de pagamento ou manualmente via admin

## Endpoints

| Método | Rota | Auth | Role | Descrição |
|--------|------|:----:|------|-----------|
| POST | /auth | ❌ | — | Login (email + password → JWT) |
| POST | /users | ❌ | — | Cadastro de novo usuário |
| GET | /users/me | ✅ | any | Perfil do usuário autenticado |
| PUT | /users/me | ✅ | any | Atualizar nome/senha |
| DELETE | /users/me | ✅ | any | Deletar própria conta |
| GET | /users/me/enrollments | ✅ | any | Listar matrículas do usuário |
| GET | /users | ✅ | admin | Buscar usuário por email (?email=) |
| GET | /users/{id} | ✅ | admin | Buscar usuário por ID |
| PUT | /users/{id}/role | ✅ | admin | Alterar role do usuário |
| DELETE | /users/{id} | ✅ | admin | Deletar usuário |
| GET | /courses | ❌ | — | Listar cursos publicados |
| GET | /courses/{courseID} | ❌ | — | Detalhes de um curso |
| GET | /courses/{courseID}/reviews | ❌ | — | Avaliações do curso |
| GET | /courses/{courseID}/modules | ❌ | — | Módulos do curso |
| GET | /courses/modules/{moduleID}/lessons | ❌ | — | Aulas de um módulo |
| POST | /courses | ✅ | creator/admin | Criar curso |
| PUT | /courses/{courseID} | ✅ | creator/admin | Atualizar curso |
| DELETE | /courses/{courseID} | ✅ | creator/admin | Deletar curso |
| PATCH | /courses/{courseID}/publish | ✅ | creator/admin | Publicar/despublicar |
| POST | /courses/{courseID}/modules | ✅ | creator/admin | Criar módulo |
| GET | /courses/modules/{moduleID} | ✅ | any | Detalhe do módulo |
| PUT | /courses/modules/{moduleID} | ✅ | creator/admin | Atualizar módulo |
| DELETE | /courses/modules/{moduleID} | ✅ | creator/admin | Deletar módulo |
| POST | /courses/modules/{moduleID}/lessons | ✅ | creator/admin | Criar aula |
| PUT | /courses/modules/lessons/{lessonID} | ✅ | creator/admin | Atualizar aula |
| DELETE | /courses/modules/lessons/{lessonID} | ✅ | creator/admin | Deletar aula |
| GET | /courses/modules/lessons/{lessonID}/comments | ✅ | enrolled/creator/admin | Listar comentários da aula |
| POST | /courses/modules/lessons/{lessonID}/comments | ✅ | enrolled/creator/admin | Criar comentário |
| DELETE | /courses/comments/{commentID} | ✅ | autor/creator/admin | Deletar comentário |
| POST | /courses/{courseID}/enroll | ✅ | any | Iniciar matrícula (redireciona para pagamento) |
| GET | /courses/{courseID}/enroll | ✅ | any | Status de matrícula do usuário nesse curso |
| GET | /courses/{courseID}/content | ✅ | enrolled/creator/admin | Conteúdo completo do curso |
| POST | /reviews | ✅ | enrolled | Criar avaliação |
| GET | /reviews/{id} | ✅ | any | Detalhe da avaliação |
| PUT | /reviews/{id} | ✅ | owner | Atualizar avaliação |
| DELETE | /reviews/{id} | ✅ | owner/admin | Deletar avaliação |
| POST | /webhooks/gateway | ❌ | — | Webhook de confirmação de pagamento |
| GET | /webhooks/gateway | ❌ | — | Redirect pós-pagamento |
| GET | /webhooks/gateway/status | ❌ | — | Verificar status por transaction ID |

## Como Rodar Localmente (sem Docker)

```bash
cd backend
go mod tidy
go run cmd/main.go
```

A API ficará disponível em `http://localhost:8080`.

## Como Rodar a Seed

```bash
cd backend
go run cmd/seed/main.go
```

Usuários criados pela seed (todos com senha `password123`):

| E-mail | Role |
| :--- | :--- |
| admin@test.com | admin |
| creator@test.com | creator |
| creator2@test.com | creator |
| student@test.com | student |
| student2@test.com | student |
| student3@test.com | student |
