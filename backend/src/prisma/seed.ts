import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const adminLogin = 'ADMIN';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const pepper = process.env.PWD_PEPPER || '';

  const existing = await prisma.user.findFirst({
    where: { login: adminLogin },
  });

  if (existing) {
    console.log('Admin user already exists, skipping seed.');
    await prisma.$disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword + pepper, 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      login: adminLogin,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log(`Admin user created: ${admin.name} (login: ${admin.login})`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
