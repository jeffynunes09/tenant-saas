markdown# Prompt para Claude Code - Sistema de Agendamento Multi-tenant SaaS

Você é um desenvolvedor Full Stack sênior especializado em arquiteturas escaláveis e monorepos. Vamos criar a estrutura inicial completa de um sistema de agendamento multi-tenant SaaS usando Turborepo.

## Contexto do Projeto

Sistema SaaS para agendamento de serviços (barbershops, clínicas, consultórios) com:
- **Backend**: NestJS + Prisma + PostgreSQL + WebSocket
- **Web Dashboard**: Next.js 15 + React 19 + TypeScript
- **Mobile App**: React Native + Expo + TypeScript
- **Arquitetura**: Monorepo com Turborepo

## Passo 1: Criar Estrutura do Monorepo

Crie a seguinte estrutura de pastas e arquivos:
```
agendamento-saas/
├── .gitignore
├── package.json (root)
├── turbo.json
├── pnpm-workspace.yaml
├── README.md
├── .prettierrc
├── .prettierignore
├── apps/
│   ├── api/
│   ├── web/
│   └── mobile/
└── packages/
    ├── database/
    ├── types/
    ├── ui/
    ├── config/
    └── utils/
```

### Arquivo: `package.json` (root)
```json
{
  "name": "agendamento-saas",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "db:generate": "cd packages/database && pnpm prisma generate",
    "db:migrate": "cd packages/database && pnpm prisma migrate dev",
    "db:studio": "cd packages/database && pnpm prisma studio",
    "db:seed": "cd packages/database && pnpm prisma db seed"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "prettier": "^3.3.0",
    "@turbo/gen": "^2.0.0"
  },
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  }
}
```

### Arquivo: `turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^type-check"]
    }
  }
}
```

### Arquivo: `pnpm-workspace.yaml`
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### Arquivo: `.gitignore`
```
# dependencies
node_modules
.pnp
.pnp.js

# testing
coverage

# next.js
.next/
out/
build
dist/

# misc
.DS_Store
*.pem
.env
.env*.local

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# turbo
.turbo

# vercel
.vercel

# typescript
*.tsbuildinfo

# expo
.expo/
dist/

# prisma
packages/database/generated/
```

### Arquivo: `.prettierrc`
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

## Passo 2: Configurar Package `database`

### Arquivo: `packages/database/package.json`
```json
{
  "name": "@agendamento/database",
  "version": "1.0.0",
  "main": "./index.ts",
  "types": "./index.ts",
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.20.0"
  },
  "devDependencies": {
    "prisma": "^5.20.0",
    "tsx": "^4.7.0"
  }
}
```

### Arquivo: `packages/database/prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== MULTI-TENANT ====================

model Tenant {
  id            String   @id @default(uuid())
  name          String
  subdomain     String   @unique
  plan          String   @default("basic") // basic, premium, enterprise
  isActive      Boolean  @default(true)
  maxUsers      Int      @default(5)
  maxAppointments Int    @default(100)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  users         User[]
  services      Service[]
  appointments  Appointment[]
  customers     Customer[]
  settings      TenantSettings?
  
  @@map("tenants")
}

model TenantSettings {
  id                String   @id @default(uuid())
  tenantId          String   @unique
  
  businessHours     Json     // { monday: { open: "09:00", close: "18:00" }, ... }
  timezone          String   @default("America/Sao_Paulo")
  currency          String   @default("BRL")
  language          String   @default("pt-BR")
  
  // Configurações de agendamento
  slotDuration      Int      @default(30) // minutos
  bufferTime        Int      @default(0)  // tempo entre agendamentos
  advanceBookingDays Int     @default(30) // quantos dias no futuro aceita agendamento
  
  // Notificações
  emailNotifications Boolean  @default(true)
  smsNotifications   Boolean  @default(false)
  pushNotifications  Boolean  @default(true)
  
  tenant            Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  @@map("tenant_settings")
}

// ==================== USERS & AUTH ====================

model User {
  id          String   @id @default(uuid())
  email       String
  name        String
  password    String
  role        String   @default("STAFF") // OWNER, ADMIN, STAFF
  isActive    Boolean  @default(true)
  
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  appointments Appointment[] @relation("StaffAppointments")
  
  @@unique([email, tenantId])
  @@index([tenantId])
  @@index([email])
  @@map("users")
}

// ==================== SERVICES ====================

model Service {
  id          String   @id @default(uuid())
  name        String
  description String?
  duration    Int      // em minutos
  price       Decimal  @db.Decimal(10, 2)
  isActive    Boolean  @default(true)
  category    String?  // Corte, Barba, Manicure, etc
  
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  appointments Appointment[]
  
  @@index([tenantId])
  @@index([tenantId, isActive])
  @@map("services")
}

// ==================== CUSTOMERS ====================

model Customer {
  id          String   @id @default(uuid())
  name        String
  email       String?
  phone       String
  notes       String?  // Observações sobre o cliente
  
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  appointments Appointment[]
  
  @@unique([phone, tenantId])
  @@index([tenantId])
  @@index([phone])
  @@map("customers")
}

// ==================== APPOINTMENTS ====================

model Appointment {
  id          String   @id @default(uuid())
  
  customerId  String
  customer    Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  serviceId   String
  service     Service  @relation(fields: [serviceId], references: [id], onDelete: Restrict)
  
  staffId     String?
  staff       User?    @relation("StaffAppointments", fields: [staffId], references: [id], onDelete: SetNull)
  
  startTime   DateTime
  endTime     DateTime
  status      String   @default("PENDING") // PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW
  
  notes       String?  // Observações do agendamento
  cancelReason String? // Motivo do cancelamento
  
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([tenantId, startTime])
  @@index([tenantId, status])
  @@index([customerId])
  @@index([staffId])
  @@map("appointments")
}
```

### Arquivo: `packages/database/prisma/seed.ts`
```typescript
import { PrismaClient } from '../generated/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Criar tenant de exemplo
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Barbearia do João',
      subdomain: 'joao',
      plan: 'premium',
      isActive: true,
      maxUsers: 10,
      maxAppointments: 500,
    },
  });

  console.log('✅ Tenant criado:', tenant.subdomain);

  // Criar configurações do tenant
  await prisma.tenantSettings.create({
    data: {
      tenantId: tenant.id,
      businessHours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '09:00', close: '14:00' },
        sunday: { open: null, close: null },
      },
      slotDuration: 30,
      bufferTime: 5,
      advanceBookingDays: 30,
    },
  });

  // Criar usuário owner
  const hashedPassword = await bcrypt.hash('senha123', 10);
  
  const owner = await prisma.user.create({
    data: {
      email: 'joao@barbearia.com',
      name: 'João Silva',
      password: hashedPassword,
      role: 'OWNER',
      tenantId: tenant.id,
    },
  });

  console.log('✅ Usuário owner criado:', owner.email);

  // Criar serviços
  const services = await prisma.service.createMany({
    data: [
      {
        name: 'Corte Masculino',
        description: 'Corte completo com máquina e tesoura',
        duration: 30,
        price: 35.00,
        category: 'Corte',
        tenantId: tenant.id,
      },
      {
        name: 'Barba',
        description: 'Barba completa com navalha',
        duration: 20,
        price: 25.00,
        category: 'Barba',
        tenantId: tenant.id,
      },
      {
        name: 'Corte + Barba',
        description: 'Combo completo',
        duration: 45,
        price: 50.00,
        category: 'Combo',
        tenantId: tenant.id,
      },
    ],
  });

  console.log('✅ Serviços criados');

  // Criar cliente de exemplo
  const customer = await prisma.customer.create({
    data: {
      name: 'Carlos Alberto',
      email: 'carlos@email.com',
      phone: '31999999999',
      tenantId: tenant.id,
    },
  });

  console.log('✅ Cliente criado:', customer.name);

  console.log('✨ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Arquivo: `packages/database/index.ts`
```typescript
export * from './generated/client';
export { PrismaClient } from './generated/client';
```

### Arquivo: `packages/database/.env.example`
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/agendamento_saas?schema=public"
```

## Passo 3: Configurar Package `types`

### Arquivo: `packages/types/package.json`
```json
{
  "name": "@agendamento/types",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "zod": "^3.23.0"
  }
}
```

### Arquivo: `packages/types/src/index.ts`
```typescript
import { z } from 'zod';

// ==================== TENANT ====================

export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  subdomain: z.string(),
  plan: z.enum(['basic', 'premium', 'enterprise']),
  isActive: z.boolean(),
  maxUsers: z.number(),
  maxAppointments: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Tenant = z.infer;

// ==================== USER ====================

export const UserRoleSchema = z.enum(['OWNER', 'ADMIN', 'STAFF']);
export type UserRole = z.infer;

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: UserRoleSchema,
  isActive: z.boolean(),
  tenantId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer;

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(3),
  password: z.string().min(6),
  role: UserRoleSchema.optional().default('STAFF'),
});

export type CreateUserDto = z.infer;

// ==================== SERVICE ====================

export const ServiceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  duration: z.number().positive(),
  price: z.number().positive(),
  isActive: z.boolean(),
  category: z.string().optional(),
  tenantId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Service = z.infer;

export const CreateServiceSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  duration: z.number().min(5).max(480), // 5 min a 8 horas
  price: z.number().positive(),
  category: z.string().optional(),
});

export type CreateServiceDto = z.infer;

// ==================== CUSTOMER ====================

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string(),
  notes: z.string().optional(),
  tenantId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Customer = z.infer;

export const CreateCustomerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\d{10,11}$/),
  notes: z.string().optional(),
});

export type CreateCustomerDto = z.infer;

// ==================== APPOINTMENT ====================

export const AppointmentStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
  'NO_SHOW',
]);

export type AppointmentStatus = z.infer;

export const AppointmentSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  staffId: z.string().uuid().optional(),
  startTime: z.date(),
  endTime: z.date(),
  status: AppointmentStatusSchema,
  notes: z.string().optional(),
  cancelReason: z.string().optional(),
  tenantId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Appointment = z.infer;

export const CreateAppointmentSchema = z.object({
  customerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  staffId: z.string().uuid().optional(),
  startTime: z.string().datetime(),
  notes: z.string().optional(),
});

export type CreateAppointmentDto = z.infer;

// ==================== AUTH ====================

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginDto = z.infer;

export const RegisterSchema = z.object({
  tenantName: z.string().min(3),
  subdomain: z.string().min(3).regex(/^[a-z0-9-]+$/),
  email: z.string().email(),
  name: z.string().min(3),
  password: z.string().min(6),
});

export type RegisterDto = z.infer;

// ==================== API RESPONSES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

## Passo 4: Configurar Package `config`

### Arquivo: `packages/config/package.json`
```json
{
  "name": "@agendamento/config",
  "version": "1.0.0",
  "main": "./index.ts",
  "types": "./index.ts"
}
```

### Arquivo: `packages/config/eslint-preset.js`
```javascript
module.exports = {
  extends: ['next', 'turbo', 'prettier'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
  },
};
```

### Arquivo: `packages/config/tsconfig/base.json`
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "exclude": ["node_modules"]
}
```

### Arquivo: `packages/config/tsconfig/react.json`
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "target": "ES2020"
  }
}
```

## Passo 5: Configurar Package `utils`

### Arquivo: `packages/utils/package.json`
```json
{
  "name": "@agendamento/utils",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "date-fns": "^3.0.0",
    "date-fns-tz": "^2.0.0"
  }
}
```

### Arquivo: `packages/utils/src/index.ts`
```typescript
export * from './date';
export * from './format';
export * from './validation';
```

### Arquivo: `packages/utils/src/date.ts`
```typescript
import { format, addMinutes, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

export function formatDate(date: Date, pattern: string = 'dd/MM/yyyy'): string {
  return format(date, pattern);
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}

export function formatDateTime(date: Date): string {
  return format(date, 'dd/MM/yyyy HH:mm');
}

export function addMinutesToDate(date: Date, minutes: number): Date {
  return addMinutes(date, minutes);
}

export function isTimeSlotAvailable(
  slotStart: Date,
  slotEnd: Date,
  existingAppointments: { startTime: Date; endTime: Date }[]
): boolean {
  return !existingAppointments.some((appointment) =>
    isWithinInterval(slotStart, {
      start: appointment.startTime,
      end: appointment.endTime,
    }) ||
    isWithinInterval(slotEnd, {
      start: appointment.startTime,
      end: appointment.endTime,
    })
  );
}

export function convertToTimezone(date: Date, timezone: string): Date {
  return utcToZonedTime(date, timezone);
}

export function convertFromTimezone(date: Date, timezone: string): Date {
  return zonedTimeToUtc(date, timezone);
}

export function getStartOfDay(date: Date): Date {
  return startOfDay(date);
}

export function getEndOfDay(date: Date): Date {
  return endOfDay(date);
}
```

### Arquivo: `packages/utils/src/format.ts`
```typescript
export function formatCurrency(value: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}
```

### Arquivo: `packages/utils/src/validation.ts`
```typescript
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
}

export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) {
    return false;
  }
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(10))) return false;
  
  return true;
}
```

## Passo 6: Criar README.md principal

### Arquivo: `README.md`
```markdown
# 🗓️ Sistema de Agendamento Multi-tenant SaaS

Sistema completo de agendamento para barbershops, clínicas e consultórios com dashboard web e aplicativo mobile.

## 🏗️ Arquitetura

- **Monorepo**: Turborepo
- **Backend**: NestJS + Prisma + PostgreSQL + WebSocket
- **Web**: Next.js 15 + React 19 + TypeScript
- **Mobile**: React Native + Expo + TypeScript

## 📦 Estrutura do Projeto
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
🚀 Como Rodar
Pré-requisitos

Node.js >= 20
pnpm >= 9
Docker + Docker Compose
PostgreSQL

1. Instalar dependências
bashpnpm install
2. Configurar variáveis de ambiente
bash# Copiar .env.example de cada app
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp packages/database/.env.example packages/database/.env
3. Subir banco de dados
bashdocker-compose up -d postgres
4. Rodar migrations e seed
bashpnpm db:generate
pnpm db:migrate
pnpm db:seed
5. Iniciar desenvolvimento
bashpnpm dev
Acesse:

API: http://localhost:3001
Web: http://localhost:3000
Mobile: Expo Go (scan QR code)

🛠️ Scripts Disponíveis
bashpnpm dev           # Inicia todos os apps em modo dev
pnpm build         # Build de todos os apps
pnpm lint          # Lint em todos os projetos
pnpm format        # Formatar código
pnpm db:generate   # Gerar Prisma Client
pnpm db:migrate    # Rodar migrations
pnpm db:studio     # Abrir Prisma Studio
pnpm db:seed       # Popular banco com dados
```

## 📝 Credenciais de Teste

Após rodar o seed:

- **Email**: joao@barbearia.com
- **Senha**: senha123
- **Tenant**: joao.localhost:3000

## 🎯 Funcionalidades

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

## 📚 Tecnologias

- **Backend**: NestJS, Prisma, PostgreSQL, Socket.io, JWT
- **Web**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Mobile**: React Native, Expo, NativeWind
- **DevOps**: Docker, Turborepo, GitHub Actions

## 📄 Licença

MIT
```

## ⚡ Executar Agora

Execute os seguintes comandos na ordem:

1. **Criar estrutura de pastas**
2. **Criar todos os arquivos de configuração do root**
3. **Configurar package `database` com Prisma**
4. **Configurar package `types` com Zod**
5. **Configurar package `config`**
6. **Configurar package `utils`**
7. **Criar README.md**

Após criar toda a estrutura base, confirme para eu te passar os próximos passos:
- Apps: API (NestJS), Web (Next.js), Mobile (Expo)




● Estrutura base do monorepo criada com sucesso! Aqui está o resumo do que foi
  configurado:

  Arquivos Criados

  Root (Configuração do Monorepo)

  - ✅ package.json - Configuração root com scripts e workspaces
  - ✅ turbo.json - Configuração do Turborepo
  - ✅ pnpm-workspace.yaml - Workspaces do pnpm
  - ✅ .gitignore - Arquivos ignorados pelo Git
  - ✅ .prettierrc - Configuração do Prettier
  - ✅ .prettierignore - Arquivos ignorados pelo Prettier
  - ✅ docker-compose.yml - PostgreSQL + Redis
  - ✅ README.md - Documentação principal

  Package: @agendamento/database

  - ✅ package.json - Prisma Client e configurações
  - ✅ prisma/schema.prisma - Schema completo multi-tenant (Tenant, User, Service,
  Customer, Appointment)
  - ✅ prisma/seed.ts - Seed com dados de exemplo
  - ✅ index.ts - Exports do Prisma Client
  - ✅ .env.example - Exemplo de variáveis de ambiente

  Package: @agendamento/types

  - ✅ package.json - Zod dependency
  - ✅ src/index.ts - Schemas e types (Tenant, User, Service, Customer, Appointment, Auth,
   DTOs)

  Package: @agendamento/config

  - ✅ package.json
  - ✅ eslint-preset.js - ESLint presets
  - ✅ tsconfig/base.json - TypeScript config base
  - ✅ tsconfig/react.json - TypeScript config React

  Package: @agendamento/utils

  - ✅ package.json - date-fns dependencies
  - ✅ src/index.ts - Exports
  - ✅ src/date.ts - Funções de data (formatDate, addMinutes, timezone, etc)
  - ✅ src/format.ts - Formatação (currency, phone, slugify)
  - ✅ src/validation.ts - Validações (email, phone, CPF)

  Estrutura de Diretórios

  agendamento-saas/
  ├── apps/
  │   ├── api/          (vazio - próximo passo)
  │   ├── web/          (vazio - próximo passo)
  │   └── mobile/       (vazio - próximo passo)
  ├── packages/
  │   ├── database/     ✅ COMPLETO
  │   ├── types/        ✅ COMPLETO
  │   ├── config/       ✅ COMPLETO
  │   └── utils/        ✅ COMPLETO
  └── [arquivos de configuração root] ✅ COMPLETO

  Próximos Passos

  Estou pronto para criar os apps:

  1. API (NestJS) - Backend com:
    - Módulos: Auth, Tenants, Users, Services, Customers, Appointments
    - JWT authentication
    - Multi-tenancy middleware
    - WebSocket gateway
    - Swagger documentation
  2. Web (Next.js 15) - Dashboard com:
    - App Router
    - Server Components
    - shadcn/ui + Tailwind CSS
    - Autenticação
    - Páginas: Dashboard, Agendamentos, Clientes, Serviços, Configurações
  3. Mobile (React Native + Expo) - App mobile com:
    - Expo Router
    - NativeWind (Tailwind CSS)
    - Busca de estabelecimentos
    - Agendamento de serviços
    - Notificações Push

  Confirme para eu começar a criar os apps! Qual você quer primeiro? (API, Web ou Mobile)?