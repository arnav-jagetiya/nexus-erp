import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const salesPasswordHash = await bcrypt.hash('Sales@123', 10);
  const warehousePasswordHash = await bcrypt.hash('Warehouse@123', 10);
  const accountsPasswordHash = await bcrypt.hash('Accounts@123', 10);

  const seedUsers = [
    {
      email: 'admin@nexus.com',
      password: passwordHash,
      name: 'Priya Sharma',
      role: UserRole.ADMIN,
    },
    {
      email: 'sales@nexus.com',
      password: salesPasswordHash,
      name: 'Rahul Verma',
      role: UserRole.SALES,
    },
    {
      email: 'warehouse@nexus.com',
      password: warehousePasswordHash,
      name: 'Deepak Patel',
      role: UserRole.WAREHOUSE,
    },
    {
      email: 'accounts@nexus.com',
      password: accountsPasswordHash,
      name: 'Ananya Gupta',
      role: UserRole.ACCOUNTS,
    },
  ];

  for (const user of seedUsers) {
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password: user.password,
        role: user.role,
        isActive: true,
      },
      create: user,
    });
    console.log(`✅ Seeded user: ${createdUser.email} (${createdUser.role})`);
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
