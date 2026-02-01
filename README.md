# Sistema de Agendamento Multi-tenant SaaS

Sistema completo de agendamento para barbershops, clínicas e consultórios com dashboard web e aplicativo mobile.

## Arquitetura

- **Monorepo**: Turborepo
- **Backend**: NestJS + Prisma + PostgreSQL + WebSocket
- **Web**: Next.js 15 + React 19 + TypeScript
- **Mobile**: React Native + Expo + TypeScript

## Estrutura do Projeto

```
agendamento-saas/
├── apps/
│   ├── api/          # Backend NestJS
│   ├── web/          # Dashboard Next.js
│   └── mobile/       # App React Native
└── packages/
    ├── database/     # Prisma + Schema
    ├── types/        # TypeScript types compartilhados
    ├── ui/           # Componentes compartilhados
    ├── config/       # Configurações ESLint/TS
    └── utils/        # Utilitários
```

## Como Rodar

### Pré-requisitos

- Node.js >= 20
- pnpm >= 9
- Docker + Docker Compose
- PostgreSQL

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar variáveis de ambiente

```bash
# Copiar .env.example de cada app
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp packages/database/.env.example packages/database/.env
```

### 3. Subir banco de dados

```bash
docker-compose up -d postgres
```

### 4. Rodar migrations e seed

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 5. Iniciar desenvolvimento

```bash
pnpm dev
```

Acesse:

- **API**: http://localhost:3001
- **Web**: http://localhost:3000
- **Mobile**: Expo Go (scan QR code)

## Scripts Disponíveis

```bash
pnpm dev           # Inicia todos os apps em modo dev
pnpm build         # Build de todos os apps
pnpm lint          # Lint em todos os projetos
pnpm format        # Formatar código
pnpm db:generate   # Gerar Prisma Client
pnpm db:migrate    # Rodar migrations
pnpm db:studio     # Abrir Prisma Studio
pnpm db:seed       # Popular banco com dados
```

## Credenciais de Teste

Após rodar o seed:

- **Email**: joao@barbearia.com
- **Senha**: senha123
- **Tenant**: joao.localhost:3000

## Funcionalidades

### Backend (API)
- [x] Autenticação JWT
- [x] Multi-tenancy
- [ ] CRUD Serviços
- [ ] CRUD Clientes
- [ ] CRUD Agendamentos
- [ ] WebSocket real-time
- [ ] Notificações Push
- [ ] Sistema de Pagamentos

### Web Dashboard
- [ ] Login/Registro
- [ ] Dashboard Analytics
- [ ] Gestão de Agendamentos
- [ ] Gestão de Clientes
- [ ] Gestão de Serviços
- [ ] Calendário
- [ ] Configurações

### Mobile App
- [ ] Buscar estabelecimentos
- [ ] Agendar serviços
- [ ] Histórico de agendamentos
- [ ] Notificações Push
- [ ] Perfil do usuário

## Tecnologias

- **Backend**: NestJS, Prisma, PostgreSQL, Socket.io, JWT
- **Web**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Mobile**: React Native, Expo, NativeWind
- **DevOps**: Docker, Turborepo, GitHub Actions

## Licença

MIT
