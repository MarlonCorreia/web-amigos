# Frontend — SPA em React/TypeScript

Interface da plataforma de cursos, desenvolvida como Single Page Application.

## Stack

| Tecnologia | Versão | Uso |
| :--- | :--- | :--- |
| React | 18 | Biblioteca de UI |
| TypeScript | — | Tipagem estática |
| Vite | — | Bundler e servidor de desenvolvimento |
| React Router DOM | v7 | Roteamento client-side |
| Material UI (MUI) | v9 | Componentes de UI |
| Tema customizado | — | Cor primária `#C2410C` (laranja) |

## Arquitetura de Pastas

```
frontend/src/
├── api/           # Funções de chamada à API (apiRequest)
│   ├── client.ts  # Base: fetch + auth header + error handling
│   ├── auth.ts
│   ├── courses.ts
│   ├── users.ts
│   ├── reviews.ts
│   └── comments.ts
├── app/           # Páginas (file-based routing manual via App.tsx)
│   ├── home/
│   ├── login/
│   ├── register/
│   ├── courses/
│   ├── courseDetails/
│   ├── create-course/
│   ├── manage-courses/
│   ├── manage-users/
│   ├── my-courses/
│   ├── payment/
│   └── profile/
├── components/    # Componentes reutilizáveis (Navbar, CourseCard, etc.)
├── contexts/      # AuthContext (estado global de autenticação)
├── hooks/         # useAuth (acessa AuthContext)
├── types/         # Interfaces TypeScript (course, user, review, enrollment, comment)
├── App.tsx        # Configuração de rotas
├── main.tsx       # Ponto de entrada
└── theme.ts       # Tema MUI customizado
```

## Fluxo de Autenticação

1. Usuário faz login → backend retorna JWT + dados do usuário
2. Token salvo em `localStorage['token']`, dados em `localStorage['user']`
3. `AuthContext` inicializa lendo o localStorage e valida o token via `GET /users/me`
4. `useAuth()` disponibiliza `{ user, isAuthenticated, loading, login, logout }` em qualquer componente
5. `apiRequest()` em `api/client.ts` injeta automaticamente `Authorization: Bearer <token>` em todas as chamadas

## Principais Páginas

| Página | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| Home | / | público | Landing page |
| Login | /login | público | Autenticação |
| Cadastro | /register | público | Criar conta |
| Cursos | /courses | público | Catálogo de cursos |
| Detalhes do Curso | /courses/:id | público/aluno | Player, módulos, avaliações, fórum Q&A |
| Meus Cursos | /my-courses | aluno | Cursos comprados |
| Criar Curso | /create-course | creator/admin | Formulário de criação |
| Gerenciar Cursos | /manage-courses | creator/admin | CRUD de cursos |
| Gerenciar Usuários | /manage-users | admin | Gestão de roles |
| Perfil | /profile | autenticado | Editar dados pessoais |
| Pagamento | /payment | autenticado | Fluxo de checkout |

## Padrão de Chamadas API

Todas as chamadas usam `apiRequest` de `api/client.ts`:

```ts
import { apiRequest } from './client'

// GET
const data = await apiRequest<MyType>('/endpoint')

// POST/PUT/DELETE
await apiRequest<void>('/endpoint', {
  method: 'POST',
  body: JSON.stringify(payload),
})
```

## Como Rodar em Desenvolvimento

```bash
cd frontend
npm install
npm run dev   # porta 3000
```

A aplicação ficará disponível em `http://localhost:3000`.

## Build de Produção

```bash
cd frontend
npm run build
```
