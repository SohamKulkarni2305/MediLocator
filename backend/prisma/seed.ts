import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // --- Users ---
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@medilocator.com' },
    update: {},
    create: {
      email: 'admin@medilocator.com',
      passwordHash,
      name: 'System Admin',
      role: 'ADMIN',
    },
  });

  const pharmacist = await prisma.user.upsert({
    where: { email: 'pharmacist@medilocator.com' },
    update: {},
    create: {
      email: 'pharmacist@medilocator.com',
      passwordHash,
      name: 'Ashok Kumar',
      role: 'PHARMACIST',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@medilocator.com' },
    update: {},
    create: {
      email: 'customer@medilocator.com',
      passwordHash,
      name: 'Test Patient',
      role: 'CUSTOMER',
      mrn: 'MRN-100234',
    },
  });

  console.log('Created test users:', { admin: admin.email, pharmacist: pharmacist.email, customer: customer.email });

  // Add more seed logic mapping from mockData.ts as needed, but for Phase 1 smoke test this is enough.
  // The rest of the tables can be empty or populated via the app.
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
