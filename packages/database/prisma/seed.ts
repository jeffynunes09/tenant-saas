import { PrismaClient } from '../generated/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Criar tenant de exemplo
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Barbearia do João',
      slug: 'joao',
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
