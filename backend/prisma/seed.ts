import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const adminDocument = '00000000000';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const pepper = process.env.PWD_PEPPER || '';

  const existing = await prisma.user.findFirst({
    where: { document: adminDocument },
  });

  if (existing) {
    console.log('Admin user already exists, skipping seed.');
    await prisma.$disconnect();
    return;
  }

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(adminPassword + pepper, salt);

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      document: adminDocument,
      password: hashedPassword,
      salt,
      role: 'ADMIN',
    },
  });

  console.log(`Admin user created: ${admin.name} (document: ${admin.document})`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
