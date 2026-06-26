# Database — PostgreSQL

Documentação do schema do banco de dados da plataforma de cursos.

## Diagrama

![Schema do Banco de Dados](schema.png)

## Tecnologia

**PostgreSQL 15-alpine** executado via Docker.

Conexão configurada pela variável de ambiente `DATABASE_URL` no formato:

```
postgres://user:pass@host:5432/dbname?sslmode=disable
```

## Schema das Tabelas

### `users`

| Coluna | Tipo | Constraint | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK, default gen_random_uuid() | Identificador único |
| email | VARCHAR(255) | UNIQUE, NOT NULL | E-mail de login |
| password_hash | VARCHAR(255) | NOT NULL | Senha em bcrypt |
| full_name | VARCHAR(255) | NOT NULL | Nome completo |
| role | VARCHAR(50) | NOT NULL | 'admin', 'creator' ou 'student' |
| created_at | TIMESTAMP | auto | Data de criação |

### `courses`

| Coluna | Tipo | Constraint | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK | Identificador |
| creator_id | UUID | FK → users.id | Criador do curso |
| title | VARCHAR(255) | NOT NULL | Título |
| description | TEXT | | Descrição |
| thumbnail_url | VARCHAR(255) | | URL da imagem de capa |
| gateway_product_id | VARCHAR(255) | | ID do produto no gateway |
| price | DECIMAL(10,2) | | Preço |
| access_duration_days | INT | nullable | Dias de acesso após compra |
| is_published | BOOL | default false | Visível no catálogo |
| created_at | TIMESTAMP | auto | Data de criação |

### `modules`

| Coluna | Tipo | Constraint | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK | Identificador |
| course_id | UUID | FK → courses.id | Curso pai |
| title | VARCHAR(255) | NOT NULL | Título do módulo |
| position | INT | NOT NULL | Ordem dentro do curso |
| created_at / updated_at | TIMESTAMP | auto | Timestamps |

### `lessons`

| Coluna | Tipo | Constraint | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK | Identificador |
| module_id | UUID | FK → modules.id | Módulo pai |
| course_id | UUID | FK → courses.id | Curso (denormalizado) |
| title | VARCHAR(255) | NOT NULL | Título da aula |
| description | TEXT | | Descrição |
| youtube_id | VARCHAR(255) | | ID do vídeo no YouTube |
| duration_minutes | INT | nullable | Duração |
| position | INT | NOT NULL | Ordem no módulo |
| is_free | BOOL | default false | Aula gratuita (preview) |
| created_at | TIMESTAMP | auto | Data de criação |

### `enrollments`

| Coluna | Tipo | Constraint | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK | Identificador |
| user_id | UUID | FK → users.id | Aluno |
| course_id | UUID | FK → courses.id | Curso |
| gateway_transaction_id | VARCHAR(255) | | ID da transação |
| status | VARCHAR(50) | NOT NULL | 'active', 'expired', 'pending', 'refunded', 'desactive' |
| expires_at | TIMESTAMP | nullable | Data de expiração do acesso |
| created_at | TIMESTAMP | auto | Data de criação |

### `course_reviews`

| Coluna | Tipo | Constraint | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK | Identificador |
| course_id | UUID | FK → courses.id | Curso avaliado |
| user_id | UUID | FK → users.id | Avaliador |
| rating | INT | NOT NULL, CHECK 1-5 | Nota de 1 a 5 |
| comment | TEXT | | Comentário |
| created_at / updated_at | TIMESTAMP | auto | Timestamps |

### `lesson_comments` 

| Coluna | Tipo | Constraint | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK | Identificador |
| lesson_id | UUID | FK → lessons.id, INDEX | Aula |
| user_id | UUID | FK → users.id, INDEX | Autor |
| content | TEXT | NOT NULL | Conteúdo do comentário |
| created_at | TIMESTAMP | auto | Data de criação |

## Relacionamentos

| Tabela origem | Cardinalidade | Tabela destino | Chave estrangeira |
| :--- | :---: | :--- | :--- |
| users | 1→N | courses | creator_id |
| users | 1→N | enrollments | user_id |
| users | 1→N | course_reviews | user_id |
| users | 1→N | lesson_comments | user_id |
| courses | 1→N | modules | course_id |
| courses | 1→N | lessons | course_id (denorm) |
| courses | 1→N | enrollments | course_id |
| courses | 1→N | course_reviews | course_id |
| modules | 1→N | lessons | module_id |
| lessons | 1→N | lesson_comments | lesson_id |
